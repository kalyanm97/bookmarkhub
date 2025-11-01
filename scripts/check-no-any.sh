#!/usr/bin/env bash
set -euo pipefail

echo "Checking for explicit 'any' in source..."
found=0
while IFS= read -r -d $'\0' file; do
  if grep -nH --line-number --color=never "\bany\b" "$file" >/dev/null; then
    echo "Found 'any' in: $file"
    found=1
  fi
done < <(find backend/src frontend/src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 2>/dev/null || true)

if [ "$found" -eq 1 ]; then
  echo "Explicit 'any' found in source. Please remove or replace with proper types." >&2
  exit 2
fi
echo "No explicit 'any' found in source directories."
