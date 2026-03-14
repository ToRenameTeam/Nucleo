#!/usr/bin/env bash
# Runs ktfmtFormat only on the Gradle subprojects that contain the staged Kotlin files.
# Usage: ktfmt-staged.sh <file1.kt> <file2.kt> ...

set -euo pipefail

if [ "$#" -eq 0 ]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Collect unique Gradle subproject paths from the staged files (Bash 3.2 compatible)
PROJECTS=()

contains_project() {
  local needle="$1"
  local item
  for item in "${PROJECTS[@]-}"; do
    if [ "$item" = "$needle" ]; then
      return 0
    fi
  done
  return 1
}

for file in "$@"; do
  # Make path relative to repo root
  rel="${file#"$REPO_ROOT"/}"
  # The first path component is the subproject directory (e.g. "appointments-service")
  subproject="${rel%%/*}"
  # Only consider directories that actually have a build.gradle.kts
  if [ -f "$REPO_ROOT/$subproject/build.gradle.kts" ]; then
    if ! contains_project "$subproject"; then
      PROJECTS+=("$subproject")
    fi
  fi
done

if [ "${#PROJECTS[@]}" -eq 0 ]; then
  exit 0
fi

# Build the Gradle task list (e.g. :appointments-service:ktfmtFormat)
TASKS=()
for proj in "${PROJECTS[@]}"; do
  TASKS+=(":${proj}:ktfmtFormat")
done

echo "Running ktfmtFormat on: ${TASKS[*]}"
cd "$REPO_ROOT"
./gradlew "${TASKS[@]}"
