import { useState, useEffect } from "react";

export default function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [inputText, setInputText] = useState("");
    const [reply, setReply] = useState("");
    const [error, setError] = useState("");
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/todos")
            .then(res => res.json())
            .then(data => setTodos(data));
    }, []);

    const sendMessage = async (text) => {
        setError("");
        try {
            const res = await fetch("http://localhost:5000/message", {
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
        const res = await fetch("http://localhost:5000/todos", { method: "DELETE" });
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

    return (
        <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
            <h1>Speech To-Do</h1>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                    placeholder="Speech Input..."
                    style={{ flex: 1, padding: "8px 12px", fontSize: 16 }}
                />
                <button onClick={() => sendMessage(inputText)}>Send</button>
                <button onClick={startListening} style={{ background: isListening ? "red" : "#3b82f6", color: "white", border: "none", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/>
                    </svg>
                </button>
            </div>

            {reply && <p style={{ color: "green" }}>{reply}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>To-Do's</h2>
                <button onClick={clearTodos} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: 4 }}>Clear</button>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {todos.map(todo => (
                    <li key={todo.id} style={{ padding: "8px 12px", marginBottom: 6, background: "#f3f4f6", color: "#111", display: "flex", justifyContent: "space-between" }}>
                        <span>{todo.title}</span>
                        {todo.date && <span style={{ color: "#666", fontSize: 14 }}>{todo.date}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
