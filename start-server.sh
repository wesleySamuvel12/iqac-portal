#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js server on 127.0.0.1:3000..."
  npx next dev -p 3000 --hostname 127.0.0.1
  echo "[$(date)] Server exited with code $?. Restarting in 3 seconds..."
  sleep 3
done
