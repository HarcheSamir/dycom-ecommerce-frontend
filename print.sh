#!/bin/bash

# Step 1: Show project structure
echo "===== PROJECT STRUCTURE ====="
tree -I "node_modules|dist|build"

# Step 2: Print only text-based files
echo -e "\n===== FILE CONTENTS ====="
find . -type f \
  ! -path "./node_modules/*" \
  ! -path "./.git/*" \
  ! -path "./dist/*" \
  ! -path "./build/*" \
  ! -name "package-lock.json" \
  ! -name "print.sh" \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
     -o -name "*.css" -o -name "*.html" -o -name "*.json" \
     -o -name "*.md" -o -name "*.cjs" \) \
  -exec sh -c '
    for f; do
      echo -e "\033[1;34m\n===== FILE: $f =====\033[0m"
      cat "$f"
    done
  ' _ {} +