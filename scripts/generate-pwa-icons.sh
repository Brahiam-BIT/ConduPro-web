#!/usr/bin/env bash
# Genera iconos PWA desde public/favicon.svg (requiere ImageMagick).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/public"
CMD="${IMAGEMAGICK_CMD:-magick}"
$CMD -background none favicon.svg -resize 192x192 pwa-192x192.png
$CMD -background none favicon.svg -resize 512x512 pwa-512x512.png
$CMD -background none favicon.svg -resize 180x180 apple-touch-icon.png
echo "Iconos generados en public/"
