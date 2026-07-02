#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REGION="${AWS_REGION:-us-east-1}"
INSTANCE_NAME="${EC2_INSTANCE_NAME:-presswall-debian}"
INSTANCE_TYPE="${EC2_INSTANCE_TYPE:-t3.micro}"
KEY_NAME="${EC2_KEY_NAME:-presswall-debian}"
SG_NAME="${EC2_SG_NAME:-presswall-debian-sg}"
ROLE_NAME="${EC2_ROLE_NAME:-PresswallEc2Role}"
PROFILE_NAME="${EC2_PROFILE_NAME:-PresswallEc2Profile}"
ECR_REPO="${ECR_REPO_NAME:-presswall}"
PROD_URL="${SHOPIFY_APP_URL:-https://presswall.noxify.io}"
PROD_HOST="${PROD_URL#https://}"
PROD_HOST="${PROD_HOST#http://}"
PROD_HOST="${PROD_HOST%%/*}"
ENV_FILE="${DEPLOY_ENV_FILE:-.env.production.local}"
KEY_PATH="${EC2_KEY_PATH:-$HOME/.ssh/${KEY_NAME}.pem}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
elif [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1090
  source .env.local
  set +a
else
  echo "Missing $ENV_FILE (or .env.local)." >&2
  exit 1
fi

export SHOPIFY_APP_URL="$PROD_URL"
SCOPES="${SCOPES:-write_app_proxy,read_themes}"

for required in SHOPIFY_API_KEY SHOPIFY_API_SECRET TURSO_DATABASE_URL TURSO_AUTH_TOKEN; do
  if [[ -z "${!required:-}" ]]; then
    echo "Missing required env var: $required" >&2
    exit 1
  fi
done

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}:latest"

put_secret() {
  local name="$1"
  local value="$2"
  if aws secretsmanager describe-secret --secret-id "$name" >/dev/null 2>&1; then
    aws secretsmanager put-secret-value --secret-id "$name" --secret-string "$value" >/dev/null
  else
    aws secretsmanager create-secret --name "$name" --secret-string "$value" >/dev/null
  fi
}

echo "==> Syncing secrets"
put_secret "presswall/shopify-api-key" "$SHOPIFY_API_KEY"
put_secret "presswall/shopify-api-secret" "$SHOPIFY_API_SECRET"
put_secret "presswall/turso-auth-token" "$TURSO_AUTH_TOKEN"
put_secret "presswall/turso-database-url" "$TURSO_DATABASE_URL"

EC2_TRUST='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'

if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$EC2_TRUST" >/dev/null
fi

aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly >/dev/null 2>&1 || true

SECRETS_POLICY="$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "secretsmanager:GetSecretValue",
    "Resource": "arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:presswall/*"
  }]
}
EOF
)"
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name PresswallEc2SecretsRead --policy-document "$SECRETS_POLICY" >/dev/null

if ! aws iam get-instance-profile --instance-profile-name "$PROFILE_NAME" >/dev/null 2>&1; then
  aws iam create-instance-profile --instance-profile-name "$PROFILE_NAME" >/dev/null
  aws iam add-role-to-instance-profile --instance-profile-name "$PROFILE_NAME" --role-name "$ROLE_NAME"
  sleep 10
else
  aws iam add-role-to-instance-profile --instance-profile-name "$PROFILE_NAME" --role-name "$ROLE_NAME" >/dev/null 2>&1 || true
fi

if [[ ! -f "$KEY_PATH" ]]; then
  mkdir -p "$(dirname "$KEY_PATH")"
  aws ec2 create-key-pair --key-name "$KEY_NAME" --query KeyMaterial --output text --region "$REGION" >"$KEY_PATH"
  chmod 600 "$KEY_PATH"
  echo "==> Saved SSH key to $KEY_PATH"
fi

VPC_ID="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text --region "$REGION")"
SG_ID="$(aws ec2 describe-security-groups --filters Name=group-name,Values="$SG_NAME" Name=vpc-id,Values="$VPC_ID" --query 'SecurityGroups[0].GroupId' --output text --region "$REGION" 2>/dev/null || true)"
if [[ -z "$SG_ID" || "$SG_ID" == "None" ]]; then
  SG_ID="$(aws ec2 create-security-group --group-name "$SG_NAME" --description "Presswall Debian VPS" --vpc-id "$VPC_ID" --query GroupId --output text --region "$REGION")"
  SSH_CIDR="${SSH_CIDR:-$(curl -fsS https://checkip.amazonaws.com)/32}"
  echo "==> Restricting SSH ingress to ${SSH_CIDR} (override with SSH_CIDR)"
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr "$SSH_CIDR" --region "$REGION" >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$REGION" >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 --region "$REGION" >/dev/null
fi

AMI_ID="$(aws ec2 describe-images \
  --owners 136693071363 \
  --filters "Name=name,Values=debian-12-amd64-*" "Name=state,Values=available" "Name=architecture,Values=x86_64" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text \
  --region "$REGION")"

if [[ -z "$AMI_ID" || "$AMI_ID" == "None" ]]; then
  echo "Could not find Debian 12 AMI in $REGION" >&2
  exit 1
fi

USER_DATA_FILE="$(mktemp)"
cat >"$USER_DATA_FILE" <<EOF
#!/bin/bash
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y docker.io awscli curl ca-certificates gnupg apt-transport-https

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

systemctl enable docker caddy
systemctl start docker

if ! grep -q "^/swapfile" /etc/fstab; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >>/etc/fstab
  echo "vm.swappiness=10" >/etc/sysctl.d/99-presswall-swappiness.conf
  sysctl -p /etc/sysctl.d/99-presswall-swappiness.conf
fi

REGION="${REGION}"
ACCOUNT_ID="${ACCOUNT_ID}"
IMAGE_URI="${IMAGE_URI}"
PROD_URL="${PROD_URL}"
PROD_HOST="${PROD_HOST}"
SCOPES="${SCOPES}"

aws ecr get-login-password --region "\$REGION" | docker login --username AWS --password-stdin "\${ACCOUNT_ID}.dkr.ecr.\${REGION}.amazonaws.com"

SHOPIFY_API_KEY="\$(aws secretsmanager get-secret-value --secret-id presswall/shopify-api-key --region "\$REGION" --query SecretString --output text)"
SHOPIFY_API_SECRET="\$(aws secretsmanager get-secret-value --secret-id presswall/shopify-api-secret --region "\$REGION" --query SecretString --output text)"
TURSO_AUTH_TOKEN="\$(aws secretsmanager get-secret-value --secret-id presswall/turso-auth-token --region "\$REGION" --query SecretString --output text)"
TURSO_DATABASE_URL="\$(aws secretsmanager get-secret-value --secret-id presswall/turso-database-url --region "\$REGION" --query SecretString --output text)"

docker rm -f presswall >/dev/null 2>&1 || true
docker pull "\$IMAGE_URI"
docker run -d --name presswall --restart unless-stopped \\
  -p 127.0.0.1:3000:3000 \\
  -e NODE_ENV=production \\
  -e PORT=3000 \\
  -e SHOPIFY_APP_URL="\$PROD_URL" \\
  -e SCOPES="\$SCOPES" \\
  -e TURSO_DATABASE_URL="\$TURSO_DATABASE_URL" \\
  -e SHOPIFY_API_KEY="\$SHOPIFY_API_KEY" \\
  -e SHOPIFY_API_SECRET="\$SHOPIFY_API_SECRET" \\
  -e TURSO_AUTH_TOKEN="\$TURSO_AUTH_TOKEN" \\
  "\$IMAGE_URI"

cat >/etc/caddy/Caddyfile <<CADDY
\$PROD_HOST {
  encode gzip
  reverse_proxy 127.0.0.1:3000
}
CADDY

systemctl reload caddy
EOF

INSTANCE_ID="$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=$INSTANCE_NAME" "Name=instance-state-name,Values=running,pending,stopping,stopped" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text \
  --region "$REGION" 2>/dev/null || true)"

if [[ -z "$INSTANCE_ID" || "$INSTANCE_ID" == "None" ]]; then
  echo "==> Launching Debian EC2 instance ($INSTANCE_TYPE)"
  INSTANCE_ID="$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --iam-instance-profile Name="$PROFILE_NAME" \
    --user-data "file://$USER_DATA_FILE" \
    --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3","DeleteOnTermination":true,"Encrypted":true}}]' \
    --metadata-options HttpTokens=required,HttpEndpoint=enabled \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --query 'Instances[0].InstanceId' \
    --output text \
    --region "$REGION")"
else
  echo "==> Reusing instance $INSTANCE_ID (re-running bootstrap via SSM would be needed for updates)"
fi

rm -f "$USER_DATA_FILE"

echo "==> Waiting for instance to run"
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

ALLOCATION_ID="$(aws ec2 describe-addresses --filters "Name=instance-id,Values=$INSTANCE_ID" --query 'Addresses[0].AllocationId' --output text --region "$REGION" 2>/dev/null || true)"
if [[ -z "$ALLOCATION_ID" || "$ALLOCATION_ID" == "None" ]]; then
  ALLOCATION_ID="$(aws ec2 allocate-address --domain vpc --query AllocationId --output text --region "$REGION")"
  aws ec2 associate-address --instance-id "$INSTANCE_ID" --allocation-id "$ALLOCATION_ID" --region "$REGION" >/dev/null
fi

PUBLIC_IP="$(aws ec2 describe-addresses --allocation-ids "$ALLOCATION_ID" --query 'Addresses[0].PublicIp' --output text --region "$REGION")"

echo "==> Done"
echo "Instance: $INSTANCE_ID"
echo "Elastic IP: $PUBLIC_IP"
echo "SSH: ssh -i $KEY_PATH admin@$PUBLIC_IP"
echo ""
echo "DNS: create an A record"
echo "  $PROD_HOST -> $PUBLIC_IP"
echo ""
echo "Bootstrap takes 3-5 minutes (Docker + Caddy + HTTPS cert)."
echo "Then run: shopify app deploy --config prod"