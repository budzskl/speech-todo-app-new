import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [inputText, setInputText] = useState("");
    const [error, setError] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const getTasksForDate = (date) =>
        todos.filter(todo => todo.date && new Date(todo.date).toDateString() === date.toDateString());

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
            setTodos(data.todos);
            setInputText("");
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.reply));
        } catch (e) {
            setError(`Failed to reach server: ${e.message}`);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { setError("Speech recognition not supported in this browser"); return; }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => setError(`Mic error: ${e.error}`);

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInputText(transcript);
            sendMessage(transcript);
        };

        recognition.start();
    };

    const clearTodos = async () => {
        const res = await fetch("http://127.0.0.1:5000/todos", { method: "DELETE" });
        if (res.ok) setTodos([]);
    };


    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)", fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif" }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "white",
                padding: "32px 20px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)"
            }}>
                <h1 style={{ margin: "0 0 8px 0", fontSize: "32px", fontWeight: "700", letterSpacing: "-0.5px" }}>🎙️ Speech To-Do</h1>
            </div>

            {/* Main Container */}
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
                {/* Input Area */}
                <div style={{ 
                    background: "white", 
                    padding: "20px", 
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    marginBottom: "24px"
                }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                            placeholder="Type or speak your task..."
                            style={{ 
                                flex: 1, 
                                padding: "12px 14px", 
                                fontSize: "15px",
                                border: "2px solid #e5e7eb",
                                borderRadius: "8px",
                                fontFamily: "inherit",
                                transition: "all 0.2s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#4f46e5"}
                            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        />
                        <button
                            onClick={() => sendMessage(inputText)}
                            style={{
                                padding: "12px 20px",
                                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "8px",
                                fontWeight: "600",
                                fontSize: "14px",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)"
                            }}
                        >
                            Send
                        </button>
                        <button
                            onClick={startListening}
                            style={{
                                background: isListening ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                color: "white",
                                border: "none",
                                padding: "12px 20px",
                                cursor: "pointer",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)"
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/>
                            </svg>
                        </button>
                    </div>

                    {error && <p style={{ margin: "12px 0 0 0", padding: "10px 12px", background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", color: "#dc2626", borderRadius: "6px", fontSize: "14px", fontWeight: "500", border: "1px solid #f87171" }}>✕ {error}</p>}
                </div>

                {/* Calendar Content */}
                <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", padding: "24px", marginBottom: "24px" }}>
                    <div style={{ margin: "0 -24px" }}>
                        <Calendar
                            value={currentDate}
                            onChange={setCurrentDate}
                            tileContent={({ date }) => {
                                const count = getTasksForDate(date).length;
                                return count > 0 ? <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: "600" }}>{count} task{count > 1 ? "s" : ""}</div> : null;
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                        <h3 style={{ margin: "0", color: "#1f2937", fontSize: "18px", fontWeight: "600" }}>📋 All Tasks</h3>
                        <button 
                            onClick={clearTodos} 
                            style={{ 
                                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", 
                                color: "#dc2626", 
                                border: "none", 
                                padding: "10px 16px", 
                                cursor: "pointer", 
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)"
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Task List */}
                    {todos.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: "16px", fontWeight: "500" }}>🎯 No tasks yet. Create one using voice or text!</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                            {todos.map((todo, index) => (
                                <li 
                                    key={todo.id} 
                                    style={{ 
                                        padding: "16px", 
                                        marginBottom: index === todos.length - 1 ? "0" : "12px", 
                                        background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", 
                                        color: "#1f2937", 
                                        display: "flex", 
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderRadius: "10px",
                                        border: "1px solid #e5e7eb",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        <input 
                                            type="checkbox" 
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#4f46e5", borderRadius: "4px" }}
                                        />
                                        <span style={{ fontSize: "16px", fontWeight: "500" }}>{todo.title}</span>
                                    </div>
                                    {todo.date && (
                                        <span style={{ 
                                            color: "#6366f1", 
                                            fontSize: "13px",
                                            background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            fontWeight: "500",
                                            border: "1px solid #c7d2fe"
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
