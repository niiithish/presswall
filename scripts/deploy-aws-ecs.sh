#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${ECS_CLUSTER_NAME:-presswall}"
SERVICE_NAME="${ECS_SERVICE_NAME:-presswall}"
TASK_FAMILY="${ECS_TASK_FAMILY:-presswall}"
ECR_REPO="${ECR_REPO_NAME:-presswall}"
ALB_NAME="${ALB_NAME:-presswall-alb}"
TG_NAME="${TG_NAME:-presswall-tg}"
LOG_GROUP="${LOG_GROUP:-/ecs/presswall}"
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
SCOPES="${SCOPES:-write_app_proxy,read_themes}"

for required in SHOPIFY_API_KEY SHOPIFY_API_SECRET TURSO_DATABASE_URL TURSO_AUTH_TOKEN; do
  if [[ -z "${!required:-}" ]]; then
    echo "Missing required env var: $required" >&2
    exit 1
  fi
done

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}:latest"
EXEC_ROLE_NAME="PresswallEcsExecutionRole"
TASK_ROLE_NAME="PresswallEcsTaskRole"

put_secret() {
  local name="$1"
  local value="$2"
  if aws secretsmanager describe-secret --secret-id "$name" >/dev/null 2>&1; then
    aws secretsmanager put-secret-value --secret-id "$name" --secret-string "$value" >/dev/null
  else
    aws secretsmanager create-secret --name "$name" --secret-string "$value" >/dev/null
  fi
  aws secretsmanager describe-secret --secret-id "$name" --query ARN --output text
}

ensure_role() {
  local role_name="$1"
  local trust_policy="$2"
  local managed_policy_arn="$3"

  if ! aws iam get-role --role-name "$role_name" >/dev/null 2>&1; then
    aws iam create-role --role-name "$role_name" --assume-role-policy-document "$trust_policy" >/dev/null
  fi

  aws iam attach-role-policy --role-name "$role_name" --policy-arn "$managed_policy_arn" >/dev/null 2>&1 || true
}

echo "==> Ensuring ECR image exists"
aws ecr describe-images --repository-name "$ECR_REPO" --region "$REGION" --image-ids imageTag=latest >/dev/null

echo "==> Syncing secrets"
SECRET_API_KEY_ARN="$(put_secret "presswall/shopify-api-key" "$SHOPIFY_API_KEY")"
SECRET_API_SECRET_ARN="$(put_secret "presswall/shopify-api-secret" "$SHOPIFY_API_SECRET")"
SECRET_TURSO_TOKEN_ARN="$(put_secret "presswall/turso-auth-token" "$TURSO_AUTH_TOKEN")"

ECS_TRUST='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ecs-tasks.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'

ensure_role "$EXEC_ROLE_NAME" "$ECS_TRUST" "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
ensure_role "$TASK_ROLE_NAME" "$ECS_TRUST" "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"

TASK_POLICY_DOC="$(cat <<EOF
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
aws iam put-role-policy --role-name "$EXEC_ROLE_NAME" --policy-name PresswallEcsSecretsRead --policy-document "$TASK_POLICY_DOC" >/dev/null

EXEC_ROLE_ARN="$(aws iam get-role --role-name "$EXEC_ROLE_NAME" --query Role.Arn --output text)"
TASK_ROLE_ARN="$(aws iam get-role --role-name "$TASK_ROLE_NAME" --query Role.Arn --output text)"

echo "==> Ensuring ECS cluster and log group"
aws ecs describe-clusters --clusters "$CLUSTER_NAME" --region "$REGION" --query 'clusters[0].status' --output text 2>/dev/null | grep -q ACTIVE \
  || aws ecs create-cluster --cluster-name "$CLUSTER_NAME" --region "$REGION" >/dev/null
aws logs create-log-group --log-group-name "$LOG_GROUP" --region "$REGION" 2>/dev/null || true

VPC_ID="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text --region "$REGION")"
SUBNET_IDS="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$VPC_ID" Name=default-for-az,Values=true --query 'Subnets[*].SubnetId' --output text --region "$REGION")"
SUBNET_ARRAY=($SUBNET_IDS)

SG_ID="$(aws ec2 describe-security-groups --filters Name=group-name,Values=presswall-ecs-sg Name=vpc-id,Values="$VPC_ID" --query 'SecurityGroups[0].GroupId' --output text --region "$REGION" 2>/dev/null || true)"
if [[ -z "$SG_ID" || "$SG_ID" == "None" ]]; then
  SG_ID="$(aws ec2 create-security-group --group-name presswall-ecs-sg --description "Presswall ECS service" --vpc-id "$VPC_ID" --query GroupId --output text --region "$REGION")"
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region "$REGION" >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$REGION" >/dev/null
fi

ALB_ARN="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text --region "$REGION" 2>/dev/null || true)"
if [[ -z "$ALB_ARN" || "$ALB_ARN" == "None" ]]; then
  ALB_ARN="$(aws elbv2 create-load-balancer \
    --name "$ALB_NAME" \
    --subnets "${SUBNET_ARRAY[@]}" \
    --security-groups "$SG_ID" \
    --scheme internet-facing \
    --type application \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text \
    --region "$REGION")"
fi

ALB_DNS="$(aws elbv2 describe-load-balancers --load-balancer-arns "$ALB_ARN" --query 'LoadBalancers[0].DNSName' --output text --region "$REGION")"
TG_ARN="$(aws elbv2 describe-target-groups --names "$TG_NAME" --query 'TargetGroups[0].TargetGroupArn' --output text --region "$REGION" 2>/dev/null || true)"
if [[ -z "$TG_ARN" || "$TG_ARN" == "None" ]]; then
  TG_ARN="$(aws elbv2 create-target-group \
    --name "$TG_NAME" \
    --protocol HTTP \
    --port 3000 \
    --vpc-id "$VPC_ID" \
    --target-type ip \
    --health-check-path "/" \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text \
    --region "$REGION")"
fi

LISTENER_ARN="$(aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --query 'Listeners[?Port==`80`].ListenerArn | [0]' --output text --region "$REGION")"
if [[ "$LISTENER_ARN" == "None" || -z "$LISTENER_ARN" ]]; then
  aws elbv2 create-listener \
    --load-balancer-arn "$ALB_ARN" \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn="$TG_ARN" \
    --region "$REGION" >/dev/null
fi

TASK_DEF_FILE="$(mktemp)"
cat >"$TASK_DEF_FILE" <<EOF
{
  "family": "$TASK_FAMILY",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$EXEC_ROLE_ARN",
  "taskRoleArn": "$TASK_ROLE_ARN",
  "containerDefinitions": [
    {
      "name": "presswall",
      "image": "$IMAGE_URI",
      "essential": true,
      "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3000" },
        { "name": "SHOPIFY_APP_URL", "value": "$PROD_URL" },
        { "name": "SCOPES", "value": "$SCOPES" },
        { "name": "TURSO_DATABASE_URL", "value": "$TURSO_DATABASE_URL" }
      ],
      "secrets": [
        { "name": "SHOPIFY_API_KEY", "valueFrom": "$SECRET_API_KEY_ARN" },
        { "name": "SHOPIFY_API_SECRET", "valueFrom": "$SECRET_API_SECRET_ARN" },
        { "name": "TURSO_AUTH_TOKEN", "valueFrom": "$SECRET_TURSO_TOKEN_ARN" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "$LOG_GROUP",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

TASK_DEF_ARN="$(aws ecs register-task-definition --cli-input-json "file://$TASK_DEF_FILE" --query 'taskDefinition.taskDefinitionArn' --output text --region "$REGION")"
rm -f "$TASK_DEF_FILE"

SERVICE_ARN="$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --region "$REGION" --query 'services[0].serviceArn' --output text 2>/dev/null || true)"
if [[ -z "$SERVICE_ARN" || "$SERVICE_ARN" == "None" ]]; then
  echo "==> Creating ECS service"
  aws ecs create-service \
    --cluster "$CLUSTER_NAME" \
    --service-name "$SERVICE_NAME" \
    --task-definition "$TASK_DEF_ARN" \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$(printf '"%s",' "${SUBNET_ARRAY[@]}" | sed 's/,$//')],securityGroups=[\"$SG_ID\"],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$TG_ARN,containerName=presswall,containerPort=3000" \
    --region "$REGION" >/dev/null
else
  echo "==> Updating ECS service"
  aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$SERVICE_NAME" \
    --task-definition "$TASK_DEF_ARN" \
    --desired-count 1 \
    --region "$REGION" >/dev/null
fi

echo "==> Done"
echo "ALB DNS: http://$ALB_DNS"
echo "Next: point presswall.noxify.io CNAME to $ALB_DNS"
echo "Then add HTTPS (ACM cert) and run: shopify app deploy --config prod"