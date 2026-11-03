#!/usr/bin/env bash
# Genera le miniature del catalogo da colorare (public/colora-thumbs) con ImageMagick.
# Uso: bash scripts/make-thumbs.sh   (poi: npm run colora:scan)
set -euo pipefail
cd "$(dirname "$0")/.."
for f in public/colora/*/*.{png,jpg,jpeg,webp}; do
  [ -e "$f" ] || continue
  cat=$(basename "$(dirname "$f")"); name=$(basename "${f%.*}")
  mkdir -p "public/colora-thumbs/$cat"
  convert "$f" -colorspace Gray -resize 320x320 -quality 72 "public/colora-thumbs/$cat/$name.jpg"
done
echo "miniature aggiornate"
