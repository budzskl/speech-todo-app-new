#!/bin/bash
set -e

cd "$(dirname "$0")/flask-backend"

if [ ! -d "env" ]; then
  python3 -m venv env
fi

source env/bin/activate
pip install -r requirements.txt

if [ ! -f "app/database.db" ]; then
  cd app && python init_db.py && cd ..
else
  echo "db already exists, skipping init"
fi

if [ ! -f "app/.env" ]; then
  echo "warning: no .env found in flask-backend/app/ - add your API key there"
fi

flask --app app/server.py --debug run
