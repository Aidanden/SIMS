#!/bin/bash
PID=$(lsof -t -i:4040  )
if [ -n "$PID" ]; then
    echo "Killing client with PID: $PID"
    kill -9 $PID
else
    echo "No client found"
fi

