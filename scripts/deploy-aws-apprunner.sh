#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REGION="${AWS_REGION:-us-east-1}"
SERVICE_NAME="${APP_RUNNER_SERVICE_NAME:-presswall}"
ECR_REPO="${ECR_REPO_NAME:-presswall}"
PROD_URL="${SHOPIFY_APP_URL:-https://presswall.noxify.io}"
ENV_FILE="${DEPLOY_ENV_FILE:-.env.production.local}"

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
export PORT="${PORT:-3000}"

for required in SHOPIFY_API_KEY SHOPIFY_API_SECRET TURSO_DATABASE_URL TURSO_AUTH_TOKEN; do
  if [[ -z "${!required:-}" ]]; then
    echo "Missing required env var: $required" >&2
    exit 1
  fi
done

SCOPES="${SCOPES:-write_app_proxy,read_themes}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE_URI="${ECR_URI}:${IMAGE_TAG}"

ACCESS_ROLE_NAME="PresswallAppRunnerAccessRole"
INSTANCE_ROLE_NAME="PresswallAppRunnerInstanceRole"

ensure_role() {
  local role_name="$1"
  local trust_policy="$2"
  local managed_policy_arn="$3"

  if ! aws iam get-role --role-name "$role_name" >/dev/null 2>&1; then
    aws iam create-role \
      --role-name "$role_name" \
      --assume-role-policy-document "$trust_policy" >/dev/null
  fi

  aws iam attach-role-policy \
    --role-name "$role_name" \
    --policy-arn "$managed_policy_arn" >/dev/null 2>&1 || true
}

put_secret() {
  local name="$1"
  local value="$2"
  if aws secretsmanager describe-secret --secret-id "$name" >/dev/null 2>&1; then
    aws secretsmanager put-secret-value \
      --secret-id "$name" \
      --secret-string "$value" >/dev/null
  else
    aws secretsmanager create-secret \
      --name "$name" \
      --secret-string "$value" >/dev/null
  fi
  aws secretsmanager describe-secret --secret-id "$name" --query ARN --output text
}

echo "==> Ensuring ECR repository"
if ! aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$REGION" >/dev/null 2>&1; then
  aws ecr create-repository \
    --repository-name "$ECR_REPO" \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    --region "$REGION" >/dev/null
fi

echo "==> Building and pushing container image"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
docker build \
  --build-arg SHOPIFY_APP_URL="${PROD_URL}" \
  --build-arg SCOPES="${SCOPES}" \
  -t "$IMAGE_URI" .
docker push "$IMAGE_URI"

echo "==> Syncing secrets"
SECRET_API_KEY_ARN="$(put_secret "presswall/shopify-api-key" "$SHOPIFY_API_KEY")"
SECRET_API_SECRET_ARN="$(put_secret "presswall/shopify-api-secret" "$SHOPIFY_API_SECRET")"
SECRET_TURSO_TOKEN_ARN="$(put_secret "presswall/turso-auth-token" "$TURSO_AUTH_TOKEN")"

ACCESS_TRUST='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "build.apprunner.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'

INSTANCE_TRUST='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "tasks.apprunner.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'

ensure_role "$ACCESS_ROLE_NAME" "$ACCESS_TRUST" "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"

if ! aws iam get-role --role-name "$INSTANCE_ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role \
    --role-name "$INSTANCE_ROLE_NAME" \
    --assume-role-policy-document "$INSTANCE_TRUST" >/dev/null
fi

INSTANCE_POLICY_NAME="PresswallAppRunnerSecretsRead"
INSTANCE_POLICY_DOC="$(cat <<EOF
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
aws iam put-role-policy \
  --role-name "$INSTANCE_ROLE_NAME" \
  --policy-name "$INSTANCE_POLICY_NAME" \
  --policy-document "$INSTANCE_POLICY_DOC" >/dev/null

ACCESS_ROLE_ARN="$(aws iam get-role --role-name "$ACCESS_ROLE_NAME" --query Role.Arn --output text)"
INSTANCE_ROLE_ARN="$(aws iam get-role --role-name "$INSTANCE_ROLE_NAME" --query Role.Arn --output text)"

SOURCE_CONFIG="$(cat <<EOF
{
  "AuthenticationConfiguration": {
    "AccessRoleArn": "$ACCESS_ROLE_ARN"
  },
  "AutoDeploymentsEnabled": false,
  "ImageRepository": {
    "ImageIdentifier": "$IMAGE_URI",
    "ImageRepositoryType": "ECR",
    "ImageConfiguration": {
      "Port": "3000",
      "RuntimeEnvironmentVariables": {
        "NODE_ENV": "production",
        "PORT": "3000",
        "SHOPIFY_APP_URL": "$PROD_URL",
        "SCOPES": "$SCOPES",
        "TURSO_DATABASE_URL": "$TURSO_DATABASE_URL"
      },
      "RuntimeEnvironmentSecrets": {
        "SHOPIFY_API_KEY": "$SECRET_API_KEY_ARN",
        "SHOPIFY_API_SECRET": "$SECRET_API_SECRET_ARN",
        "TURSO_AUTH_TOKEN": "$SECRET_TURSO_TOKEN_ARN"
      }
    }
  }
}
EOF
)"

INSTANCE_CONFIG='{"Cpu":"256","Memory":"512","InstanceRoleArn":"'"$INSTANCE_ROLE_ARN"'"}'

SERVICE_ARN="$(aws apprunner list-services --region "$REGION" --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn | [0]" --output text)"

if [[ "$SERVICE_ARN" == "None" || -z "$SERVICE_ARN" ]]; then
  echo "==> Creating App Runner service"
  aws apprunner create-service \
    --region "$REGION" \
    --service-name "$SERVICE_NAME" \
    --source-configuration "$SOURCE_CONFIG" \
    --instance-configuration "$INSTANCE_CONFIG" \
    --health-check-configuration '{"Protocol":"HTTP","Path":"/","Interval":10,"Timeout":5,"HealthyThreshold":1,"UnhealthyThreshold":5}' \
    --query 'Service.ServiceUrl' \
    --output text
else
  echo "==> Updating App Runner service"
  aws apprunner update-service \
    --region "$REGION" \
    --service-arn "$SERVICE_ARN" \
    --source-configuration "$SOURCE_CONFIG" \
    --instance-configuration "$INSTANCE_CONFIG" \
    --health-check-configuration '{"Protocol":"HTTP","Path":"/","Interval":10,"Timeout":5,"HealthyThreshold":1,"UnhealthyThreshold":5}' \
    --query 'Service.ServiceUrl' \
    --output text
fi

echo "==> Done. Point presswall.noxify.io CNAME to the App Runner domain above, then run:"
echo "    shopify app deploy --config prod"