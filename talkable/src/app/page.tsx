"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const html = event.target?.result as string;
      // Generate a unique doc_id (e.g., using timestamp or file name)
      const doc_id = `${file.name.replace(/\\W/g, "_")}_${Date.now()}`;
      const metadata = { user: "alice" }; // You can customize this as needed

      try {
        // Store in backend via Next.js API route
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html_content: html,
            doc_id,
            metadata,
          }),
        });
        // Store in localStorage for preview
        localStorage.setItem("talkable_html", html);
        localStorage.setItem("talkable_html_doc_id", doc_id);
        // Navigate to codeEditor
        router.push("/codeEditor");
      } catch (err) {
        alert("Failed to upload HTML to backend.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #101820 0%, #1a2a2f 100%)",
        color: "#f3f3f3",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2rem 4vw 1.5rem 4vw",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg, #00ff99 0%, #00c3ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 22,
              color: "#101820",
            }}
          >
            T
          </div>
          <span style={{ fontWeight: 700, fontSize: 24, letterSpacing: -1 }}>
            Talkable Dev
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a
            href="#"
            style={{
              color: "#b2fce4",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Community
          </a>
          <a
            href="#"
            style={{
              color: "#b2fce4",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Enterprise
          </a>
          <a
            href="#"
            style={{
              color: "#b2fce4",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Learn
          </a>
          <a
            href="#"
            style={{
              color: "#b2fce4",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Shipped
          </a>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              background: "#232e2f",
              color: "#f3f3f3",
              border: "1px solid #2e3d3f",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Log in
          </button>
          <button
            style={{
              background: "linear-gradient(90deg, #00ff99 0%, #00c3ff 100%)",
              color: "#101820",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          padding: "0 4vw",
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: -2,
            textAlign: "center",
          }}
        >
          Build something{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #00ff99 0%, #00c3ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            amazing
          </span>{" "}
          with Talkable Dev
        </h1>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "#b2fce4",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          Create apps and websites by chatting with AI
        </h2>
        {/* File Upload Card */}
        <div
          style={{
            background: "#181f23",
            borderRadius: 32,
            boxShadow: "0 4px 32px 0 rgba(0,0,0,0.12)",
            padding: "32px 32px 24px 32px",
            maxWidth: 600,
            width: "100%",
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <label
            style={{
              background: "#232e2f",
              color: "#b2fce4",
              borderRadius: 16,
              padding: "16px 32px",
              fontWeight: 500,
              fontSize: 18,
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            Upload your HTML file
            <input
              type="file"
              accept=".html,text/html"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </label>
          <span style={{ color: "#b2fce4", fontSize: 15 }}>
            (Start by uploading your HTML file for live review)
          </span>
        </div>
        {/* Example Chips (optional, can be removed or kept) */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            style={{
              background: "#232e2f",
              color: "#b2fce4",
              border: "none",
              borderRadius: 24,
              padding: "10px 22px",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Startup dashboard
          </button>
          <button
            style={{
              background: "#232e2f",
              color: "#b2fce4",
              border: "none",
              borderRadius: 24,
              padding: "10px 22px",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Note taking app
          </button>
          <button
            style={{
              background: "#232e2f",
              color: "#b2fce4",
              border: "none",
              borderRadius: 24,
              padding: "10px 22px",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Hacker News top 100
          </button>
          <button
            style={{
              background: "#232e2f",
              color: "#b2fce4",
              border: "none",
              borderRadius: 24,
              padding: "10px 22px",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            SaaS landing page
          </button>
        </div>
      </main>
    </div>
  );
}
