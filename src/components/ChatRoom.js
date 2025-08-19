// client/src/components/ChatRoom.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

// Import types from the websocket library (installed dependency)
// We import from compiled JS entry for CRA compatibility
// eslint-disable-next-line no-unused-vars
import { SocketMessageTypes } from "teleparty-websocket-lib";

const { TelepartyClient } = require("teleparty-websocket-lib");

function ChatRoom({ nickname, userIcon, roomId, mode, onRoomId, onLeave }) {
  const [messages, setMessages] = useState([]);
  // map: permId -> nickname to resolve typing presence payloads
  const [permIdToName, setPermIdToName] = useState({});
  // currently active typers by nickname (excluding self)
  const [activeTypers, setActiveTypers] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  // stable handler instance for TelepartyClient
  const eventHandler = useMemo(
    () => ({
      onConnectionReady: () => {
        setConnected(true);
      },
      onClose: () => {
        setConnected(false);
      },
      onMessage: (message) => {
        const { type, data } = message || {};
        // Normalize: chat messages vs typing presence
        console.log("onMessage", message);
        const isTypingEvent = (type && String(type) === "setTypingPresence") || (data && (Array.isArray(data.usersTyping) || typeof data.anyoneTyping === "boolean"));
        if (isTypingEvent) {
          if (data && data.anyoneTyping === false) {
            setActiveTypers([]);
            return;
          }
          const ids = (data && Array.isArray(data.usersTyping)) ? data.usersTyping : [];
          const selfPermId = Object.keys(permIdToName).find((id) => permIdToName[id] === nickname);
          const names = ids
            .filter((id) => id !== selfPermId)
            .map((id) => permIdToName[id] || "Someone");
          const unique = Array.from(new Set(names));
          setActiveTypers(unique);
          return;
        }

        const isChatMessage = (data && typeof data.body === "string") || (type && ["message", "sendMessage", "sessionMessage", "chatMessage"].includes(String(type)));
        if (isChatMessage) {
          setMessages((prev) => [...prev, data]);
          if (data && data.permId && data.userNickname) {
            setPermIdToName((prev) => (prev[data.permId] ? prev : { ...prev, [data.permId]: data.userNickname }));
          }
          return;
        }
      },
    }), []);

  useEffect(() => {
    const client = new TelepartyClient(eventHandler);
    clientRef.current = client;
    return () => {
      try {
        client.teardown();
      } catch (e) {}
    };
  }, [eventHandler]);

  useEffect(() => {
    async function connect() {
      if (!clientRef.current || !connected) return;
      try {
        if (mode === "create") {
          const newRoomId = await clientRef.current.createChatRoom(nickname, userIcon);
          onRoomId && onRoomId(newRoomId);
          // Join created room to receive messages
          const history = await clientRef.current.joinChatRoom(nickname, newRoomId, userIcon);
          setMessages(history.messages || []);
        } else if (mode === "join" && roomId) {
          const history = await clientRef.current.joinChatRoom(nickname, roomId, userIcon);
          setMessages(history.messages || []);
        }
      } catch (e) {
        alert(e && e.message ? e.message : "Failed to connect to room");
      }
    }
    connect();
    // Only run when socket becomes ready or identifiers change
  }, [connected, mode, roomId, nickname, userIcon]);

  const handleSend = (text) => {
    if (!clientRef.current || !text) return;
    clientRef.current.sendMessage(SocketMessageTypes.SEND_MESSAGE, { body: text });
  };

  const handleTyping = (typing) => {
    if (!clientRef.current) return;
    clientRef.current.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, { typing: !!typing });
  };

  // Build mapping from history once loaded
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const map = {};
    messages.forEach((m) => {
      if (m && m.permId && m.userNickname) {
        map[m.permId] = m.userNickname;
      }
    });
    if (Object.keys(map).length > 0) {
      setPermIdToName((prev) => ({ ...prev, ...map }));
    }
  }, [messages]);

  return (
    <div className="container" style={{ padding: 16 }}>
      <div className="card">
        <div className="header">
          <div>
            <h2 className="title">Room: {roomId || "..."}</h2>
          </div>
          <button className="secondaryBtn" onClick={onLeave}>Leave</button>
        </div>
        <MessageList messages={messages} selfNickname={nickname} />
        {activeTypers.length > 0 && (
              <div className="system"><strong>{activeTypers.join(", ")}</strong> typing...</div>
            )}
        <div className="inputBar">
          <MessageInput onSend={handleSend} onTyping={handleTyping} />
        </div>

      </div>
    </div>
  );
}

export default ChatRoom;
