#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/share/jdk21}"

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "JDK 21 not found at $JAVA_HOME. Set JAVA_HOME to a JDK 21 installation." >&2
  exit 1
fi

echo "==> frontend"
cd "$ROOT/jenkins-plugin/src/main/frontend"
npm ci
npm run build

echo "==> plugin"
cd "$ROOT/jenkins-plugin"
JAVA_HOME="$JAVA_HOME" ./mvnw -B -ntp -DskipTests -Dspotbugs.skip=true package

echo
echo "HPI: jenkins-plugin/target/jenkins-ai-copilot.hpi"
