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
    """Return a formatted date string from a Dialogflow date param, or None."""
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
        reply = result.fulfillment_text or f"[intent: {intent}]"

        with get_db() as conn:
            if intent == "create_task":
                if result.all_required_params_present:
                    title = str(params.get("title", "")).strip()
                    date_val = extract_date(params.get("date", ""))
                    if title:
                        conn.execute("INSERT INTO tasks (title, date) VALUES (?, ?)", (title, date_val))
                        reply = f"Added: {title}" + (f" on {date_val}" if date_val else "")
            elif intent == "edit_task":
                task_name = str(params.get("task_name", "")).strip()
                new_name = str(params.get("new-name", "")).strip()
                new_date = extract_date(params.get("date-time", ""))
                if task_name:
                    if new_name and new_date:
                        conn.execute("UPDATE tasks SET title = ?, date = ? WHERE title LIKE ?", (new_name, new_date, f"%{task_name}%"))
                        reply = f"Updated: {task_name} → {new_name} on {new_date}"
                    elif new_name:
                        conn.execute("UPDATE tasks SET title = ? WHERE title LIKE ?", (new_name, f"%{task_name}%"))
                        reply = f"Updated: {task_name} → {new_name}"
                    elif new_date:
                        conn.execute("UPDATE tasks SET date = ? WHERE title LIKE ?", (new_date, f"%{task_name}%"))
                        reply = f"Updated {task_name}'s date to {new_date}"
            elif intent == "organize_task":
                todos = [dict(t) for t in conn.execute("SELECT * FROM tasks ORDER BY date ASC").fetchall()]
                return jsonify({"intent": intent, "reply": "Tasks organized by date.", "todos": todos})

            todos = [dict(t) for t in conn.execute("SELECT * FROM tasks").fetchall()]

        return jsonify({"intent": intent, "reply": reply, "todos": todos, "_p": {k: str(v) for k, v in params.items()}, "_allparams": result.all_required_params_present})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
