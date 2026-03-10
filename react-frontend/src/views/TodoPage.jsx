import { useState, useEffect } from "react";

export default function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [inputText, setInputText] = useState("");
    const [reply, setReply] = useState("");
    const [error, setError] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetch("http://127.0.0.1:5000/todos")
            .then(res => res.json())
            .then(data => setTodos(data));
    }, []);

    const sendMessage = async (text) => {
        setError("");
        try {
            const res = await fetch("http://127.0.0.1:5000/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            if (!res.ok) {
                const err = await res.text();
                setError(`Server error ${res.status}: ${err}`);
                return;
            }
            const data = await res.json();
            setReply(data.reply);
            setTodos(data.todos);
            setInputText("");
        } catch (e) {
            setError(`Failed to reach server: ${e.message}`);
        }
    };

    const clearTodos = async () => {
        const res = await fetch("http://127.0.0.1:5000/todos", { method: "DELETE" });
        if (res.ok) {
            setTodos([]);
            setReply("");
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            setInputText(text);
            sendMessage(text);
        };
        recognition.start();
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getTasksForDate = (date) => {
        return todos.filter(todo => {
            if (!todo.date) return false;
            const todoDate = new Date(todo.date).toDateString();
            return todoDate === date.toDateString();
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const arcadeBtn = (extra = {}) => ({
        padding: "10px 18px",
        fontFamily: "'Courier New', Courier, monospace",
        fontWeight: "900",
        fontSize: "13px",
        letterSpacing: "2px",
        cursor: "pointer",
        borderRadius: "3px",
        textTransform: "uppercase",
        transition: "all 0.15s ease",
        ...extra,
    });

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ aspectRatio: "1" }} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const tasksForDay = getTasksForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            days.push(
                <div key={day} style={{
                    aspectRatio: "1",
                    border: isToday ? "2px solid #facc15" : "1px solid #1e3a5f",
                    padding: "6px",
                    background: isToday ? "#1a1200" : "#050d1a",
                    borderRadius: "3px",
                    fontSize: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.15s ease",
                    boxShadow: isToday ? "0 0 12px rgba(250, 204, 21, 0.5), inset 0 0 8px rgba(250, 204, 21, 0.1)" : "none",
                    color: isToday ? "#facc15" : "#3b82f6",
                }}>
                    <strong style={{ fontSize: "12px", marginBottom: "3px" }}>{day}</strong>
                    {tasksForDay.length > 0 && (
                        <span style={{
                            background: "#dc2626",
                            color: "#fff",
                            padding: "1px 4px",
                            borderRadius: "2px",
                            fontSize: "9px",
                            fontWeight: "900",
                            boxShadow: "0 0 6px rgba(220, 38, 38, 0.7)",
                            display: "block",
                            textAlign: "center"
                        }}>
                            {tasksForDay.length}
                        </span>
                    )}
                </div>
            );
        }

        return (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
                    <button onClick={previousMonth} style={arcadeBtn({
                        background: "#0a0a0a",
                        color: "#3b82f6",
                        border: "2px solid #1d4ed8",
                        boxShadow: "0 0 8px rgba(59, 130, 246, 0.4), 3px 3px 0px #1d4ed8",
                    })}>◄ PREV</button>
                    <h2 style={{ margin: "0", color: "#facc15", fontSize: "17px", fontWeight: "900", letterSpacing: "2px", textShadow: "0 0 12px rgba(250, 204, 21, 0.6)", fontFamily: "'Courier New', Courier, monospace" }}>
                        {monthNames[currentDate.getMonth()].toUpperCase()} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} style={arcadeBtn({
                        background: "#0a0a0a",
                        color: "#3b82f6",
                        border: "2px solid #1d4ed8",
                        boxShadow: "0 0 8px rgba(59, 130, 246, 0.4), 3px 3px 0px #1d4ed8",
                    })}>NEXT ►</button>
                </div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "5px",
                    marginBottom: "20px",
                    background: "#020810",
                    padding: "10px",
                    borderRadius: "3px",
                    border: "1px solid #1e3a5f",
                }}>
                    {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
                        <div key={d} style={{
                            fontWeight: "900",
                            textAlign: "center",
                            padding: "6px 0",
                            color: "#dc2626",
                            fontSize: "10px",
                            letterSpacing: "1px",
                            fontFamily: "'Courier New', Courier, monospace",
                            textShadow: "0 0 8px rgba(220, 38, 38, 0.6)"
                        }}>{d}</div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div style={{ minHeight: "100vh", background: "#000000", fontFamily: "'Courier New', Courier, monospace" }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(180deg, #0a0a0a 0%, #000000 100%)",
                padding: "28px 20px",
                textAlign: "center",
                borderBottom: "3px solid #dc2626",
                boxShadow: "0 4px 30px rgba(220, 38, 38, 0.3)",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* decorative top stripe */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "repeating-linear-gradient(90deg, #dc2626 0px, #dc2626 20px, #facc15 20px, #facc15 40px, #3b82f6 40px, #3b82f6 60px)" }} />
                <h1 style={{
                    margin: "0 0 6px 0",
                    fontSize: "36px",
                    fontWeight: "900",
                    letterSpacing: "4px",
                    color: "#facc15",
                    textShadow: "0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.4), 3px 3px 0px #dc2626",
                }}>🎙️ SPEECH TO-DO</h1>
            
                {/* decorative bottom stripe */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 20px, #facc15 20px, #facc15 40px, #dc2626 40px, #dc2626 60px)" }} />
            </div>

            {/* Main Container */}
            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px 20px" }}>

                {/* Input Panel */}
                <div style={{
                    background: "#050d1a",
                    padding: "20px",
                    borderRadius: "3px",
                    border: "2px solid #1d4ed8",
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.25), 4px 4px 0px #1d4ed8",
                    marginBottom: "20px",
                }}>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                            placeholder="ENTER YOUR TASK..."
                            style={{
                                flex: 1,
                                padding: "12px 14px",
                                fontSize: "14px",
                                background: "#000",
                                border: "2px solid #1e3a5f",
                                borderRadius: "3px",
                                fontFamily: "'Courier New', Courier, monospace",
                                color: "#facc15",
                                outline: "none",
                                letterSpacing: "1px",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                            }}
                            onFocus={(e) => { e.target.style.borderColor = "#facc15"; e.target.style.boxShadow = "0 0 10px rgba(250,204,21,0.3)"; }}
                            onBlur={(e) => { e.target.style.borderColor = "#1e3a5f"; e.target.style.boxShadow = "none"; }}
                        />
                        <button
                            onClick={() => sendMessage(inputText)}
                            style={arcadeBtn({
                                background: "#7f1d1d",
                                color: "#fff",
                                border: "2px solid #dc2626",
                                boxShadow: "0 0 12px rgba(220, 38, 38, 0.5), 3px 3px 0px #7f1d1d",
                                letterSpacing: "2px",
                            })}
                        >SEND</button>
                        <button
                            onClick={startListening}
                            style={{
                                background: isListening ? "#dc2626" : "#050d1a",
                                color: isListening ? "#fff" : "#3b82f6",
                                border: isListening ? "2px solid #f87171" : "2px solid #1d4ed8",
                                padding: "10px 14px",
                                cursor: "pointer",
                                borderRadius: "3px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: isListening ? "0 0 16px rgba(220,38,38,0.7), 3px 3px 0px #7f1d1d" : "0 0 8px rgba(59,130,246,0.3), 3px 3px 0px #1d4ed8",
                                transition: "all 0.15s ease",
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/>
                            </svg>
                        </button>
                    </div>

                    {reply && <p style={{ margin: "10px 0 0 0", padding: "9px 12px", background: "#052010", color: "#4ade80", borderRadius: "3px", fontSize: "13px", fontWeight: "700", border: "2px solid #16a34a", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "1px", boxShadow: "0 0 10px rgba(74,222,128,0.25)" }}>✓ {reply}</p>}
                    {error && <p style={{ margin: "10px 0 0 0", padding: "9px 12px", background: "#1a0505", color: "#f87171", borderRadius: "3px", fontSize: "13px", fontWeight: "700", border: "2px solid #dc2626", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "1px", boxShadow: "0 0 10px rgba(220,38,38,0.3)" }}>✕ {error}</p>}
                </div>

                {/* Calendar + Tasks Panel */}
                <div style={{
                    background: "#050d1a",
                    borderRadius: "3px",
                    border: "2px solid #1d4ed8",
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.2), 4px 4px 0px #1d4ed8",
                    padding: "24px",
                    marginBottom: "20px",
                }}>
                    {renderCalendar()}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingTop: "16px", borderTop: "2px solid #1e3a5f" }}>
                        <h3 style={{ margin: "0", color: "#facc15", fontSize: "16px", fontWeight: "900", letterSpacing: "3px", textShadow: "0 0 10px rgba(250, 204, 21, 0.5)" }}>
                            📋 ALL TASKS
                        </h3>
                        <button
                            onClick={clearTodos}
                            style={arcadeBtn({
                                background: "#1a0505",
                                color: "#f87171",
                                border: "2px solid #dc2626",
                                boxShadow: "0 0 8px rgba(220,38,38,0.3), 3px 3px 0px #7f1d1d",
                                padding: "8px 14px",
                            })}
                        >CLEAR ALL</button>
                    </div>

                    {todos.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#1e3a5f", padding: "40px 0", fontSize: "14px", letterSpacing: "2px" }}>
                            — NO TASKS LOADED —
                        </p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                            {todos.map((todo, index) => (
                                <li key={todo.id} style={{
                                    padding: "14px 16px",
                                    marginBottom: index === todos.length - 1 ? "0" : "8px",
                                    background: "#020810",
                                    color: "#e2e8f0",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderRadius: "3px",
                                    border: "1px solid #1e3a5f",
                                    borderLeft: "4px solid #dc2626",
                                    transition: "all 0.15s ease",
                                    boxShadow: "0 0 6px rgba(220,38,38,0.15)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <input
                                            type="checkbox"
                                            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#dc2626" }}
                                        />
                                        <span style={{ fontSize: "14px", color: "#e2e8f0", letterSpacing: "0.5px" }}>{todo.title}</span>
                                    </div>
                                    {todo.date && (
                                        <span style={{
                                            color: "#facc15",
                                            fontSize: "12px",
                                            background: "#0a0a00",
                                            padding: "4px 10px",
                                            borderRadius: "2px",
                                            border: "1px solid #854d0e",
                                            letterSpacing: "1px",
                                            boxShadow: "0 0 6px rgba(250,204,21,0.2)",
                                            fontWeight: "700"
                                        }}>
                                            📅 {new Date(todo.date).toLocaleDateString()}
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