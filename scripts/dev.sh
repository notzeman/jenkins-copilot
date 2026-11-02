#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/share/jdk21}"

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "JDK 21 not found at $JAVA_HOME. Set JAVA_HOME to a JDK 21 installation." >&2
  exit 1
fi

cd "$ROOT/jenkins-plugin/src/main/frontend"
npm ci
npm run build

cd "$ROOT/jenkins-plugin"
echo "Starting Jenkins with the plugin on http://localhost:8080/jenkins"
echo "Stop with Ctrl+C."
exec env JAVA_HOME="$JAVA_HOME" ./mvnw -B -ntp -DskipTests -Dspotbugs.skip=true hpi:run
