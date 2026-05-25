#!/usr/bin/env bash
# Rebuild CanvasKit WASM with Skia PDF backend (skia_enable_pdf=true).
# Requires: depot_tools, emsdk, git, ninja. Run on Linux or WSL/Docker.
set -euo pipefail

SKIA_VERSION="${SKIA_VERSION:-main}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/deps"

echo ">>> Fetching Skia (${SKIA_VERSION})..."
if [ ! -d skia ]; then
  git clone https://github.com/google/skia.git --depth 1 --branch "${SKIA_VERSION}"
fi
cd skia
git fetch --depth 1 origin "${SKIA_VERSION}" || true
git checkout "${SKIA_VERSION}"

echo ">>> Syncing dependencies..."
python3 tools/git-sync-deps

echo ">>> Building CanvasKit with PDF..."
cd modules/canvaskit
# Enable PDF in GN args (default compile.sh sets skia_enable_pdf=false)
export EXTRA_GN_ARGS="skia_enable_pdf=true"
./compile.sh release

echo ">>> Packaging npm tarball..."
cd npm_build
npm pack
mkdir -p "${OUT_DIR}"
mv rollerbird-canvaskit-wasm-pdf-*.tgz "${OUT_DIR}/" 2>/dev/null || mv canvaskit-wasm-*.tgz "${OUT_DIR}/rollerbird-canvaskit-wasm-pdf-custom.tgz" || cp ../*.wasm "${OUT_DIR}/"

echo "Done. Install in project:"
echo "  npm install file:${OUT_DIR}/<tarball>.tgz"
