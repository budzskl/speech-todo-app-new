set -e

cd "$(dirname "$0")/flask-backend"

python3 -m venv env

source env/bin/activate
pip install -r requirements.txt

cd app && python init_db.py && cd ..

flask --app app/server.py --debug run
