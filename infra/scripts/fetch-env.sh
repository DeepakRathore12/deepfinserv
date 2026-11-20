#!/usr/bin/env bash
# Writes /etc/dkfinance/{api,web}.env from SSM Parameter Store (SecureString, KMS-encrypted).
# The EC2 instance role needs ssm:GetParametersByPath and kms:Decrypt on /dkfinance/prod/*.
set -euo pipefail
PREFIX="${SSM_PREFIX:-/dkfinance/prod}"
install -d -m 750 -o root -g dkfinance /etc/dkfinance
for app in api web; do
  tmp=$(mktemp)
  aws ssm get-parameters-by-path --path "$PREFIX/$app" --with-decryption --recursive \
    --query 'Parameters[].[Name,Value]' --output text |
    while IFS=$'\t' read -r name value; do printf '%s=%s\n' "${name##*/}" "$value"; done > "$tmp"
  install -m 640 -o root -g dkfinance "$tmp" "/etc/dkfinance/$app.env"
  rm -f "$tmp"
done
echo "Environment files written."
