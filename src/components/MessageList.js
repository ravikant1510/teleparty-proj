import React, { useEffect, useRef } from "react";

function MessageList({ messages, selfNickname }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="messages card">
      {messages.map((msg, idx) => {
        if (msg.isSystemMessage) {
          const name = msg.userNickname || "Someone";
          return (
            <div key={idx} className="system" style={{ textAlign: "center", margin: "6px 0" }}>
              {name} {msg.body}
            </div>
          );
        }

        const isSelf = msg.userNickname === selfNickname;
        // Assign a deterministic accent color based on username for easy distinction
        const colorSeed = (msg.userNickname || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const hue = (colorSeed * 37) % 360;
        const accent = `hsl(${hue} 70% 45%)`;
        return (
          <div key={idx} className={`row ${isSelf ? "self" : "other"}`}>
            <div className={`bubble ${isSelf ? "bubble-self" : "bubble-other"}`} style={isSelf ? { borderLeft: `4px solid ${accent}` } : { borderLeft: `4px solid ${accent}` }}>
              {!isSelf && (
                <div className="meta" style={{ marginBottom: 4, color: accent, fontWeight: 700 }}>{msg.userNickname || "User"}</div>
              )}
              <div style={{ color: isSelf ? "#0b4536" : "#111827", fontWeight: 500 }}>{msg.body}</div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

export default MessageList;
