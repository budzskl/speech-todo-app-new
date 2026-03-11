from contextlib import contextmanager
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import dialogflow
from datetime import datetime
import sqlite3
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "dialogflow.json"
)

app = Flask(__name__)
CORS(app)

PROJECT_ID = "todo-bot-cjcw"


def extract_date(param):
    if not param:
        return None
    if hasattr(param, "__iter__") and not isinstance(param, (str, bytes)) and not hasattr(param, "get"):
        items = list(param)
        param = items[0] if items else None
    if not param:
        return None
    if hasattr(param, "get"):
        raw = next(
            (str(param.get(k)).strip() for k in ("date_time", "startDateTime", "startDate") if param.get(k)),
            ""
        )
    else:
        raw = str(param).strip()
    return datetime.fromisoformat(raw[:10]).strftime("%B %d, %Y") if raw and raw != "None" else None


DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.db")
df_client = dialogflow.SessionsClient()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def get_param(params, key):
    val = params.get(key, "")
    if hasattr(val, "__iter__") and not isinstance(val, str):
        items = list(val)
        val = items[0] if items else ""
    return str(val).strip()


def process_intent(intent, params, result, conn):
    reply = result.fulfillment_text or f"[intent: {intent}]"

    if intent == "create_task":
        if result.all_required_params_present:
            title = str(params.get("title", "")).strip()
            date_val = extract_date(params.get("date", ""))
            if title:
                conn.execute("INSERT INTO tasks (title, date) VALUES (?, ?)", (title, date_val))
                reply = f"Added: {title}" + (f" on {date_val}" if date_val else "")

    elif intent == "edit_task_name":
        task_name = str(params.get("task_name", "")).strip()
        new_name = str(params.get("new_name", "")).strip()
        if task_name and new_name:
            conn.execute("UPDATE tasks SET title = ? WHERE title LIKE ?", (new_name, f"%{task_name}%"))
            reply = f"Renamed {task_name} to {new_name}"

    elif intent == "edit_task_date":
        task_name = str(params.get("task_name", "")).strip()
        new_date = extract_date(params.get("date_time", ""))
        if task_name and new_date:
            conn.execute("UPDATE tasks SET date = ? WHERE title LIKE ?", (new_date, f"%{task_name}%"))
            reply = f"Updated {task_name}'s date to {new_date}"

    elif intent == "organize_task":
        date_period = params.get("date-period", "")
        date_time = params.get("date-time", "")

        if date_period and hasattr(date_period, "get"):
            start = date_period.get("startDate") or date_period.get("startDateTime", "")
            end = date_period.get("endDate") or date_period.get("endDateTime", "")
            start_dt = datetime.fromisoformat(str(start)[:10]) if start else None
            end_dt = datetime.fromisoformat(str(end)[:10]) if end else None
            if start_dt and end_dt:
                all_tasks = [dict(t) for t in conn.execute("SELECT * FROM tasks WHERE date IS NOT NULL").fetchall()]
                in_range = [t for t in all_tasks if start_dt <= datetime.strptime(t["date"], "%B %d, %Y") <= end_dt]
                label = f"{start_dt.strftime('%B %d')} to {end_dt.strftime('%B %d, %Y')}"
                reply = (
                    f"You have {len(in_range)} task{'s' if len(in_range) != 1 else ''} from {label}: {', '.join(t['title'] for t in in_range)}."
                    if in_range else f"No tasks from {label}."
                )
        elif date_time:
            target_date = extract_date(date_time) or datetime.now().strftime("%B %d, %Y")
            on_date = [dict(t) for t in conn.execute("SELECT * FROM tasks WHERE date = ?", (target_date,)).fetchall()]
            reply = (
                f"You have {len(on_date)} task{'s' if len(on_date) != 1 else ''} on {target_date}: {', '.join(t['title'] for t in on_date)}."
                if on_date else f"No tasks on {target_date}."
            )
        else:
            reply = "What date or time range would you like to organize by?"

    todos = [dict(t) for t in conn.execute("SELECT * FROM tasks").fetchall()]
    return reply, todos


@app.route("/todos", methods=["GET"])
def get_todos():
    with get_db() as conn:
        return jsonify([dict(t) for t in conn.execute("SELECT * FROM tasks").fetchall()])


@app.route("/todos", methods=["DELETE"])
def clear_todos():
    with get_db() as conn:
        conn.execute("DELETE FROM tasks")
    return jsonify({"ok": True})


@app.route("/message", methods=["POST"])
def message():
    try:
        text = request.json["text"]
        session = df_client.session_path(PROJECT_ID, "session-1")
        query = dialogflow.QueryInput(text=dialogflow.TextInput(text=text, language_code="en"))
        result = df_client.detect_intent(session=session, query_input=query).query_result
        intent = result.intent.display_name
        params = dict(result.parameters)

        with get_db() as conn:
            reply, todos = process_intent(intent, params, result, conn)

        return jsonify({"intent": intent, "reply": reply, "todos": todos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500