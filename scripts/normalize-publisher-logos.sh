#!/usr/bin/env bash
# Trim transparent padding and normalize bundled publisher logos to a uniform ink height.
# Usage: ./scripts/normalize-publisher-logos.sh [target_ink_height]

set -euo pipefail

TARGET_HEIGHT="${1:-120}"
LOGO_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/publishers/logos"
FUZZ="2%"

normalize_logo() {
  local src="$1"
  local dest="$2"

  magick "$src" -alpha on \
    -bordercolor none -border 1 \
    -fuzz "$FUZZ" -trim +repage \
    -resize "x${TARGET_HEIGHT}" \
    PNG32:"$dest"

  echo "Wrote $(basename "$dest") ($(magick identify -format '%wx%h' "$dest"))"
}

for logo in "$LOGO_DIR"/*.png; do
  [[ -f "$logo" ]] || continue
  tmp="${logo}.tmp"
  normalize_logo "$logo" "$tmp"
  mv "$tmp" "$logo"
done

echo "Normalized logos in $LOGO_DIR to ink height ${TARGET_HEIGHT}px"