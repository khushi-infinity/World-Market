#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JAR="$ROOT/server/target/guild-1.0.0.jar"

if [[ -z "${JAVA_HOME:-}" && -d "/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home" ]]; then
  export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home"
fi

if [[ -n "${JAVA_HOME:-}" ]]; then
  JAVA="$JAVA_HOME/bin/java"
else
  JAVA="java"
fi

if [[ ! -f "$JAR" ]]; then
  echo "Forging the server jar for the first time..."
  (cd "$ROOT/server" && mvn -q -DskipTests package)
fi

PORT="${SERVER_PORT:-8080}"
echo "Opening the hall at http://localhost:$PORT"
(cd "$ROOT/server" && "$JAVA" -jar "$JAR") &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Waiting for the hall to answer on port $PORT..."
READY=0
for _ in $(seq 1 60); do
  if curl -fsS "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [[ "$READY" != "1" ]]; then
  echo "The server did not answer. Check the output above, then try again."
  exit 1
fi

if [[ ! -d "$ROOT/client/node_modules" ]]; then
  echo "Installing client dependencies..."
  npm --prefix "$ROOT/client" install
fi

echo "Raising the client at http://localhost:5173"
npm --prefix "$ROOT/client" run dev
