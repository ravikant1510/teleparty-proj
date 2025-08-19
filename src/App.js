import React, { useState } from "react";
import ChatRoom from "./components/ChatRoom";

function App() {
  const [nickname, setNickname] = useState("");
  const [userIcon, setUserIcon] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [mode, setMode] = useState("join"); // "join" | "create"

  const handleCreateRoom = () => {
    if (!nickname) {
      alert("Enter a nickname first");
      return;
    }
    setMode("create");
    setJoined(true);
  };

  const handleJoinRoom = () => {
    if (!nickname || !roomId) {
      alert("Enter nickname and room ID");
      return;
    }
    setMode("join");
    setJoined(true);
  };

  if (joined) {
    return (
      <ChatRoom
        nickname={nickname}
        userIcon={userIcon}
        roomId={roomId}
        mode={mode}
        onRoomId={(id) => setRoomId(id)}
        onLeave={() => {
          setJoined(false);
        }}
      />
    );
  }

  return (
    <div className="container" style={{ padding: 16 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 className="title" style={{ fontSize: 36, marginBottom: 16 }}>Teleparty Chat</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
          <input
            type="text"
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Avatar URL (optional)"
            value={userIcon}
            onChange={(e) => setUserIcon(e.target.value)}
          />
          <button className="primaryBtn" onClick={handleCreateRoom}>Create Room</button>
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <div/>
          <button className="secondaryBtn" onClick={handleJoinRoom}>Join Room</button>
        </div>
        <div className="system" style={{ marginTop: 8 }}>
          - Enter a nickname then click Create Room, or paste a room ID and Join
        </div>
      </div>
    </div>
  );
}

export default App;
