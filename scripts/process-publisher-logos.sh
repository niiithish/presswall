#!/usr/bin/env bash
# Install publisher logos as black silhouettes on transparent backgrounds.
# Usage: ./scripts/process-publisher-logos.sh /path/to/source/dir

set -euo pipefail

SRC_DIR="${1:-}"
TARGET_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/publishers/logos"

if [[ -z "$SRC_DIR" || ! -d "$SRC_DIR" ]]; then
  echo "Usage: $0 /path/to/source/logos" >&2
  exit 1
fi

process_logo() {
  local src="$1"
  local dest="$2"

  magick "$src" -resize '1200x400>' -alpha on \
    \( +clone -alpha extract -threshold 30% -write mpr:alpha +delete \) \
    -alpha off -fill black -colorize 100 \
    mpr:alpha -compose CopyOpacity -composite \
    PNG32:"$dest"

  echo "Wrote $(basename "$dest") ($(magick identify -format 'alpha=%A %wx%h' "$dest"))"
}

declare -A MAP=(
  [forbes]="toppng.com-forbes-logo-1309x512.png"
  [entrepreneur]="511-5114230_entrepreneur-logo-entrepreneur-logo-no-background-hd-png.png"
  [inc]="inc.png"
  [fast-company]="toppng.com-fast-company-logo-1203x512.png"
  [bloomberg]="pngfind.com-bloomberg-logo-png-1842886.png"
  [business-insider]="pngfind.com-investments-png-6730312.png"
  [cnbc]="cnbc-logo-of-nbc-business-business-3daf2a5bf1ffd7070c59dcde11bd34a6.png"
  [fortune]="477-4776766_fortune-magazine-logo-png-transparent-png.png"
  [harvard-business-review]="557-5578709_transparent-harvard-business-review-hd-png-download.png"
  [techcrunch]="613-6137411_tech-crunch-logo-png-transparent-png.png"
  [wired]="451-4513441_wired-february-26th-dosist-wired-logo-white-png.png"
  [the-verge]="theverge.png"
  [mashable]="toppng.com-mashable-mashable-awards-819x153.png"
  [new-york-times]="291-2915139_new-york-times-logo-white-hd-png-download.png"
  [wall-street-journal]="48-488603_wall-street-journal-svg-hd-png-download.png"
  [bbc]="552-5523844_bbc-hd-png-download.png"
  [usa-today]="usatoday.png"
  [washington-post]="clipart3335981.png"
  [cnn]="338-3384909_cnn-united-states-news-text-logo-png-image.png"
  [the-guardian]="258-2588977_newspaper-the-guardian-logo-hd-png-download.png"
)

mkdir -p "$TARGET_DIR"

for id in "${!MAP[@]}"; do
  src_file="$SRC_DIR/${MAP[$id]}"
  if [[ ! -f "$src_file" ]]; then
    echo "Skip $id (missing $src_file)" >&2
    continue
  fi
  process_logo "$src_file" "$TARGET_DIR/${id}.png"
done

for id in forbes entrepreneur inc fast-company bloomberg business-insider cnbc fortune harvard-business-review techcrunch wired the-verge mashable new-york-times wall-street-journal washington-post bbc cnn the-guardian usa-today; do
  src_file="$SRC_DIR/${id}.png"
  if [[ -f "$src_file" ]]; then
    process_logo "$src_file" "$TARGET_DIR/${id}.png"
  fi
done