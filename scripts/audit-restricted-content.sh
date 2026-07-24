#!/usr/bin/env bash
# Restricted-content audit for Caroline (Party Dice).
#
# Searches shipped source and resources for alcohol/drinking-related terms
# in English, Chinese, and Swedish. Exits non-zero if any unexplained hit is
# found, so this can be wired into CI.
#
# Usage: scripts/audit-restricted-content.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v rg >/dev/null 2>&1; then
  echo "error: ripgrep (rg) is required to run this audit." >&2
  exit 2
fi

# Latin-alphabet whole-word terms (word-boundary matched, so "shot" does not
# flag "screenshot" and "vin" does not flag "vintage").
LATIN_WORDS=(drink drinking drunk sip shot beer wine alcohol cocktail cheers dricka alkohol öl vin)

# Multi-word phrases (matched as substrings, case-insensitive).
PHRASES=("bottoms up" "waterfall")

# CJK terms (matched as substrings — CJK script has no word-boundary spacing).
CJK=(喝 酒 干杯 一口 啤酒 饮酒)

# Directories/files scanned. Generated build output, dependencies, and Git
# internals are intentionally excluded — only shipped source/resources are
# audited. `docs/` and `AGENTS.md` are deliberately excluded: they are
# project-internal governance documents that describe the restriction
# itself (e.g. this script's own docstring lists the banned terms) and are
# never bundled into the app or its store listing.
SEARCH_PATHS=(src ios/App/App public capacitor.config.ts package.json)

RG_EXCLUDES=(
  --glob '!node_modules/**'
  --glob '!dist/**'
  --glob '!dist-ssr/**'
  --glob '!.output/**'
  --glob '!.vinxi/**'
  --glob '!.nitro/**'
  --glob '!ios/App/App.xcodeproj/**'
  --glob '!ios/App/Pods/**'
  --glob '!ios/App/CapApp-SPM/.build/**'
  --glob '!*.lock'
)

# Documented, pre-approved false positives. Format: "file:line" — hits at
# these exact locations are reported but do not affect the exit code,
# because they've been manually reviewed and confirmed harmless. Keep this
# list empty unless a real false positive is found and explained here.
ALLOWLIST=()

EXISTING_PATHS=()
for p in "${SEARCH_PATHS[@]}"; do
  [ -e "$p" ] && EXISTING_PATHS+=("$p")
done

TMP_HITS="$(mktemp)"
trap 'rm -f "$TMP_HITS"' EXIT

run_search() {
  local pattern="$1"
  local extra_flag="${2:-}"
  # shellcheck disable=SC2086
  rg -in "${RG_EXCLUDES[@]}" $extra_flag "$pattern" "${EXISTING_PATHS[@]}" 2>/dev/null || true
}

for term in "${LATIN_WORDS[@]}"; do
  run_search "\\b${term}\\b" "-w" >>"$TMP_HITS"
done
for phrase in "${PHRASES[@]}"; do
  run_search "$phrase" >>"$TMP_HITS"
done
for term in "${CJK[@]}"; do
  run_search "$term" >>"$TMP_HITS"
done

sort -u -o "$TMP_HITS" "$TMP_HITS"

if [ ! -s "$TMP_HITS" ]; then
  echo "Restricted-content audit: no matches found across ${EXISTING_PATHS[*]}."
  exit 0
fi

UNEXPLAINED=0
echo "Restricted-content audit: found matches —"
while IFS= read -r line; do
  loc="${line%%:*}:$(echo "$line" | cut -d: -f2)"
  allowed=0
  for a in "${ALLOWLIST[@]:-}"; do
    [ "$loc" = "$a" ] && allowed=1 && break
  done
  if [ "$allowed" = "1" ]; then
    echo "  [allowlisted] $line"
  else
    echo "  [UNEXPLAINED] $line"
    UNEXPLAINED=$((UNEXPLAINED + 1))
  fi
done <"$TMP_HITS"

if [ "$UNEXPLAINED" -gt 0 ]; then
  echo ""
  echo "$UNEXPLAINED unexplained restricted-content match(es). Remove them or add a" >&2
  echo "reviewed, documented entry to ALLOWLIST in this script with a reason." >&2
  exit 1
fi

echo ""
echo "All matches are documented allowlist entries. Exiting 0."
exit 0
