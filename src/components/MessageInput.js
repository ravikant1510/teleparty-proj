import React, { useEffect, useRef, useState } from "react";

function MessageInput({ onSend, onTyping }) {
  const [input, setInput] = useState("");
  const typingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping && onTyping(true);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      onTyping && onTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend && onSend(text);
    setInput("");
    typingRef.current = false;
    onTyping && onTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="flex-1 border px-3 py-2"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
      />
      <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={handleSend}>Send</button>
    </div>
  );
}

export default MessageInput;
