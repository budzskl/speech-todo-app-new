import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetch("http://127.0.0.1:5000/todos")
            .then(res => res.json())
            .then(data => setTodos(data));
    }, []);

    const sendMessage = async (text) => {
        try {
            const res = await fetch("http://127.0.0.1:5000/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            if (!res.ok) return;
            const data = await res.json();
            setTodos(data.todos);
            setInputText("");
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.reply));
        } catch (e) {
            console.error(e);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => console.error(`Mic error: ${e.error}`);
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
            setInputText(transcript);
            if (e.results[e.results.length - 1].isFinal) sendMessage(transcript);
        };
        recognition.start();
    };

    const clearTodos = async () => {
        const res = await fetch("http://127.0.0.1:5000/todos", { method: "DELETE" });
        if (res.ok) setTodos([]);
    };

    const getTasksForDate = (date) =>
        todos.filter(todo => todo.date && new Date(todo.date).toDateString() === date.toDateString());

    const tileContent = ({ date, view }) => {
        if (view === "month" && getTasksForDate(date).length > 0) {
            return <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#dc2626", margin: "2px auto 0" }} />;
        }
        return null;
    };

    return (
        <div style={{ minHeight: "100vh", background: "#08090e", fontFamily: "'Courier New', Courier, monospace", color: "#e2e8f0" }}>

            {/* Header */}
            <div style={{
                padding: "24px 20px",
                textAlign: "center",
                borderBottom: "1px solid #1e3a5f",
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "900",
                    letterSpacing: "6px",
                    color: "#facc15",
                }}>🎙 SPEECH TO-DO</h1>
            </div>

            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 20px" }}>

                {/* Input Panel */}
                <div style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "24px",
                }}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                        placeholder="TYPE A COMMAND..."
                        style={{
                            flex: 1,
                            padding: "11px 14px",
                            fontSize: "13px",
                            background: "#0d1117",
                            border: "1px solid #1e3a5f",
                            borderRadius: "3px",
                            fontFamily: "'Courier New', Courier, monospace",
                            color: "#facc15",
                            outline: "none",
                            letterSpacing: "1px",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                        onBlur={(e) => e.target.style.borderColor = "#1e3a5f"}
                    />
                    <button
                        onClick={() => sendMessage(inputText)}
                        style={{
                            padding: "11px 16px",
                            background: "#0d1117",
                            color: "#facc15",
                            border: "1px solid #facc15",
                            borderRadius: "3px",
                            fontFamily: "'Courier New', Courier, monospace",
                            fontWeight: "900",
                            fontSize: "12px",
                            letterSpacing: "2px",
                            cursor: "pointer",
                        }}
                    >SEND</button>
                    <button
                        onClick={startListening}
                        style={{
                            padding: "11px 14px",
                            background: isListening ? "#dc2626" : "#0d1117",
                            color: isListening ? "#fff" : "#3b82f6",
                            border: `1px solid ${isListening ? "#dc2626" : "#3b82f6"}`,
                            borderRadius: "3px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/>
                        </svg>
                    </button>
                </div>

                {/* Calendar */}
                <div style={{ marginBottom: "24px" }}>
                    <style>{`
                        .react-calendar {
                            width: 100%;
                            background: #0d1117;
                            border: 1px solid #1e3a5f;
                            border-radius: 3px;
                            font-family: 'Courier New', Courier, monospace;
                            color: #e2e8f0;
                        }
                        .react-calendar__navigation {
                            background: #0d1117;
                            border-bottom: 1px solid #1e3a5f;
                        }
                        .react-calendar__navigation button {
                            background: transparent;
                            color: #3b82f6;
                            border: none;
                            font-family: 'Courier New', Courier, monospace;
                            font-weight: 900;
                            font-size: 12px;
                            letter-spacing: 1px;
                            cursor: pointer;
                            padding: 10px;
                        }
                        .react-calendar__navigation button:hover {
                            color: #facc15;
                            background: transparent;
                        }
                        .react-calendar__navigation__label {
                            color: #facc15 !important;
                            font-size: 13px !important;
                            letter-spacing: 3px !important;
                        }
                        .react-calendar__month-view__weekdays__weekday abbr {
                            text-decoration: none;
                            font-weight: 900;
                            color: #dc2626;
                            font-size: 10px;
                            letter-spacing: 1px;
                        }
                        .react-calendar__tile {
                            background: transparent;
                            color: #94a3b8;
                            border: none;
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 12px;
                            padding: 8px 4px;
                            cursor: pointer;
                            border-radius: 2px;
                        }
                        .react-calendar__tile:hover {
                            background: #1e3a5f;
                            color: #e2e8f0;
                        }
                        .react-calendar__tile--now {
                            background: transparent !important;
                            color: #facc15 !important;
                            font-weight: 900;
                        }
                        .react-calendar__tile--active {
                            background: #1d4ed8 !important;
                            color: #fff !important;
                        }
                        .react-calendar__month-view__days__day--neighboringMonth {
                            color: #2d3748 !important;
                        }
                    `}</style>
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileContent={tileContent}
                    />
                </div>

                {/* Tasks */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", letterSpacing: "3px", color: "#64748b" }}>ALL TASKS</span>
                        <button
                            onClick={clearTodos}
                            style={{
                                padding: "6px 12px",
                                background: "transparent",
                                color: "#dc2626",
                                border: "1px solid #dc2626",
                                borderRadius: "3px",
                                fontFamily: "'Courier New', Courier, monospace",
                                fontSize: "11px",
                                letterSpacing: "1px",
                                cursor: "pointer",
                            }}
                        >CLEAR ALL</button>
                    </div>

                    {todos.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#2d3748", padding: "32px 0", fontSize: "12px", letterSpacing: "2px" }}>
                            NO TASKS
                        </p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {todos.map((todo, index) => (
                                <li key={todo.id} style={{
                                    padding: "12px 14px",
                                    marginBottom: index === todos.length - 1 ? 0 : "6px",
                                    background: "#0d1117",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderRadius: "3px",
                                    border: "1px solid #1e3a5f",
                                    borderLeft: "3px solid #dc2626",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{todo.title}</span>
                                    </div>
                                    {todo.date && (
                                        <span style={{ color: "#64748b", fontSize: "11px", letterSpacing: "1px" }}>
                                            {new Date(todo.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}