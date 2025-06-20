"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CodeEditorPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [html, setHtml] = useState<string | null>(null);
  const [view, setView] = useState<"output" | "code">("output");

  useEffect(() => {
    const storedHtml = localStorage.getItem("talkable_html");
    setHtml(storedHtml);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      const aiMsg = {
        role: "ai" as const,
        content: data.content || "(no response)",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai" as const, content: "Error: Could not get response." },
      ]);
    }
    setLoading(false);
  };

  // Mic logic
  const startListening = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Audio recording not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        setLoading(true);
        try {
          const response = await fetch("/chat", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          setInput(data.transcript || "");
        } catch (err) {
          alert("Failed to transcribe audio.");
        }
        setLoading(false);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setListening(true);
    } catch (err) {
      alert("Could not access microphone.");
    }
  };

  const stopListening = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#181f23",
        color: "#f3f3f3",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left: Conversation */}
      <section
        style={{
          flex: 1.2,
          borderRight: "1.5px solid #232e2f",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#181f23",
          minWidth: 0,
        }}
      >
        <div style={{ padding: 32, borderBottom: "1.5px solid #232e2f" }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>
            Conversation
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {messages.length === 0 && (
            <div style={{ color: "#b2fce4", fontSize: 16 }}>
              [Chat with Talkable Dev will appear here]
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 18,
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: msg.role === "user" ? "#00c3ff33" : "#232e2f",
                  color: msg.role === "user" ? "#00c3ff" : "#b2fce4",
                  borderRadius: 12,
                  padding: "10px 16px",
                  maxWidth: 320,
                  wordBreak: "break-word",
                  fontSize: 16,
                }}
              >
                {msg.content}
              </span>
            </div>
          ))}
          {loading && (
            <div style={{ color: "#b2fce4", fontSize: 16, marginBottom: 18 }}>
              AI is typing...
            </div>
          )}
        </div>
        <div
          style={{
            padding: 24,
            borderTop: "1.5px solid #232e2f",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) sendMessage();
            }}
            style={{
              flex: 1,
              background: "#232e2f",
              border: "none",
              borderRadius: 12,
              color: "#f3f3f3",
              fontSize: 17,
              padding: "12px 16px",
              outline: "none",
            }}
            disabled={loading}
          />

          {/* Mic Button */}
          <button
            onClick={listening ? stopListening : startListening}
            disabled={loading}
            style={{
              background: listening ? "#ff4d4d" : "#232e2f",
              border: "none",
              borderRadius: 12,
              padding: "0 16px",
              color: listening ? "#fff" : "#b2fce4",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={listening ? "Stop recording" : "Start recording"}
          >
            🎤
          </button>

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: "linear-gradient(90deg, #00ff99 0%, #00c3ff 100%)",
              border: "none",
              borderRadius: 12,
              color: "#101820",
              fontWeight: 700,
              fontSize: 16,
              padding: "0 18px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </div>
      </section>
      {/* Right: Code/Output with Toggle */}
      <section
        style={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#101820",
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: 32,
            borderBottom: "1.5px solid #232e2f",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>
            Code / Output
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setView("output")}
              style={{
                background:
                  view === "output"
                    ? "linear-gradient(90deg, #00ff99 0%, #00c3ff 100%)"
                    : "#232e2f",
                color: view === "output" ? "#101820" : "#b2fce4",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: "8px 20px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Output
            </button>
            <button
              onClick={() => setView("code")}
              style={{
                background:
                  view === "code"
                    ? "linear-gradient(90deg, #00ff99 0%, #00c3ff 100%)"
                    : "#232e2f",
                color: view === "code" ? "#101820" : "#b2fce4",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: "8px 20px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Code
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {view === "output" ? (
            html ? (
              <iframe
                srcDoc={html}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 400,
                  border: "1px solid #232e2f",
                  borderRadius: 12,
                  background: "#fff",
                }}
                title="Live HTML Preview"
              />
            ) : (
              <div style={{ color: "#b2fce4", fontSize: 16 }}>
                [No HTML file uploaded yet]
              </div>
            )
          ) : (
            <pre
              style={{
                background: "#232e2f",
                color: "#b2fce4",
                borderRadius: 12,
                padding: 24,
                fontSize: 15,
                overflowX: "auto",
                minHeight: 400,
                maxHeight: 600,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {html || "[No HTML file uploaded yet]"}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
