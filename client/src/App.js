import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useState } from "react";
import io from "socket.io-client";
import Chat from "./Pages/Home/Chat/Chat";
import Home from "./Pages/Home/Home.js";
import Result from "./Pages/Home/Chat/Result";

// const socket = io.connect("http://34.231.209.142/");
const socket = io.connect("http://localhost:80");

function App() {
  // 사용자 이름 전달
  const [username, setUsername] = useState("");
  const [cnt, setCnt] = useState(10);

  // 방이름 전달
  // 방1개만 두려고 지하철로 지정함 - 추후 INPUT으로 게임 선택
  const room = "1호선";
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home cnt={cnt} setCnt={setCnt} username={username} setUsername={setUsername} room={room} socket={socket} />} />
          <Route path="/chat" element={<Chat cnt={cnt} setCnt={setCnt} username={username} room={room} socket={socket} />} />
          <Route path="/Result" element={<Result cnt={cnt} setCnt={setCnt} username={username} room={room} socket={socket} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
