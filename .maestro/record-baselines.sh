#!/usr/bin/env bash
# Re-record screenshot baselines on the fixed device configuration (see config.yaml).
# Usage: .maestro/record-baselines.sh [--device <id>]
# Pass 1 records the light baselines with the emulator in day mode. Pass 2 puts the emulator in
# night mode and records the flows tagged `dark`. Day mode is restored on exit.
# takeScreenshot cannot write outside Maestro's output folder, so this copies the images over.
set -euo pipefail
cd "$(dirname "$0")/.."

# Pass the device id to adb too, so the night-mode switch reaches the same emulator.
DEVICE_ARGS=()
ADB_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --device|--udid) DEVICE_ARGS+=("$1" "$2"); ADB_ARGS+=(-s "$2"); shift 2 ;;
    *) DEVICE_ARGS+=("$1"); shift ;;
  esac
done
adb_night() { adb ${ADB_ARGS[@]+"${ADB_ARGS[@]}"} shell cmd uimode night "$1" >/dev/null; }
trap 'adb_night no' EXIT

record() {
  local out
  out="$(mktemp -d)"
  maestro ${DEVICE_ARGS[@]+"${DEVICE_ARGS[@]}"} test -e RECORD=true --test-output-dir "$out" "$@" .maestro
  mkdir -p .maestro/baselines
  find "$out" -path '*/takeScreenshot/*.png' -exec cp {} .maestro/baselines/ \;
}

adb_night no
record --exclude-tags=dark
adb_night yes
record --include-tags=dark
adb_night no
ls .maestro/baselines
