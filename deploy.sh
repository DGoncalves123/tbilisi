#!/usr/bin/env bash
# One-command deploy for the GitHub Pages (/docs) photoreport.
set -euo pipefail
cd "$(dirname "$0")"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository."; exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No 'origin' remote yet. First create the repo on GitHub (EMPTY, no README/.gitignore),"
  echo "then run:"
  echo
  echo "  git remote add origin https://github.com/DGoncalves123/tbilisi-2026.git"
  echo "  ./deploy.sh"
  echo
  echo "Then enable Pages: Settings → Pages → Source = 'Deploy from a branch' → main → /docs."
  exit 1
fi

git branch -M main
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add -A
  git commit -m "Update photoreport" || true
fi

git push -u origin main
echo
echo "Pushed to origin/main. Enable GitHub Pages if not already:"
echo "  Settings → Pages → Source = 'Deploy from a branch' → branch 'main' → folder '/docs'"
echo "Site will be live at: https://DGoncalves123.github.io/tbilisi-2026/"
