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
        text = request.json["text"].lower().strip()
        reply = "I didn't understand that."
        intent = "unknown"

        with get_db() as conn:
            if text.startswith("add "):
                title = text[4:].strip()
                if title:
                    conn.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
                    reply = f"Added: {title}"
                    intent = "create_task"
            elif text.startswith("edit "):
                # Simple edit: assume "edit old to new"
                parts = text[5:].split(" to ")
                if len(parts) == 2:
                    old_name = parts[0].strip()
                    new_name = parts[1].strip()
                    conn.execute("UPDATE tasks SET title = ? WHERE title LIKE ?", (new_name, f"%{old_name}%"))
                    reply = f"Updated: {old_name} to {new_name}"
                    intent = "edit_task"
            elif "clear" in text or "delete all" in text:
                conn.execute("DELETE FROM tasks")
                reply = "All tasks cleared."
                intent = "clear_tasks"
            elif "list" in text or "show" in text:
                reply = "Here are your tasks."
                intent = "list_tasks"

            todos = [dict(t) for t in conn.execute("SELECT * FROM tasks").fetchall()]

        return jsonify({"intent": intent, "reply": reply, "todos": todos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

