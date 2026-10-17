#!/usr/bin/env bash
# Re-record screenshot baselines on the fixed device configuration (see config.yaml).
# Usage: .maestro/record-baselines.sh [--device <id>]
# takeScreenshot cannot write outside Maestro's output folder, so this copies the images over.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$(mktemp -d)"
maestro "$@" test -e RECORD=true --test-output-dir "$OUT" .maestro
mkdir -p .maestro/baselines
find "$OUT" -path '*/takeScreenshot/*.png' -exec cp {} .maestro/baselines/ \;
ls .maestro/baselines
