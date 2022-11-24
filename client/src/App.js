import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useState } from "react";
import io from "socket.io-client";
import Chat from "./Pages/Home/Chat/Chat";
import Home from "./Pages/Home/Home.js";

const socket = io.connect("http://localhost:80");

function App() {
  // 사용자 이름 전달
  const [username, setUsername] = useState("");
  // 방이름 전달
  const [room, setRoom] = useState("");
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home username={username} setUsername={setUsername} room={room} setRoom={setRoom} socket={socket} />} />
          <Route path="/chat" element={<Chat username={username} room={room} socket={socket} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
