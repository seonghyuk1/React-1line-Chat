/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

function Home({ username, setUsername, room, socket, cnt, setCnt }) {
  const navigate = useNavigate();
  // const [readyUsers, setReadyUsers] = useState([]);
  let [readyUsers, setReadyUsers] = useState([]);
  // 누군가 ready 버튼 누르면 input창 변경 금지
  const [inputOn, setInputOn] = useState(false);
  // 누군가 ready 버튼 누르면 버튼 비활성화 - 0 글자일 때도 꺼놓기 위해 초기값 true
  const [btnOn, setBtnOn] = useState(true);

  const joinRoom = () => {
    setBtnOn(true);
    setInputOn(true);
    sessionStorage.setItem("username", username);
    socket.emit("count", username);
    socket.on("count", (data) => {
      console.log(data);
      readyUsers = [...data];

      if (readyUsers.length < 3) {
        alert("다른 게임 참가자를 기다리고 있습니다.");
        socket.emit("join_room", { username, room });
      } else if (readyUsers.length == 3) {
        alert("3번째 참가자이므로 접속 후 게임이 시작 됩니다.");
        socket.emit("join_room", { username, room });
      } else {
        alert("먼저 접속한 클라이언트들 간 게임이 진행중입니다. 관전으로 이동합니다.");
        socket.emit("join_room", { username, room });
      }

      // 실패
      // data.isEnd && readyUsers.splice(0);
    });

    navigate("/chat", { replace: true });
  };

  useEffect(() => {
    username == "" ? setBtnOn(true) : setBtnOn(false);
  }, [username]);

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h3>랜덤게임</h3>
        <input className={styles.input} placeholder="닉네임 입력" onChange={(e) => setUsername(e.target.value)} disabled={inputOn} />

        {/* <select className={styles.input} onChange={(e) => setRoom(e.target.value)}> */}
        {/* <option value="1호선게임">게임선택</option> */}
        <option value="1호선게임">오늘도 평화로운 1호선</option>
        {/* </select> */}
        {username == "" ? (
          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={joinRoom} disabled={btnOn}>
            Ready
          </button>
        ) : (
          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={joinRoom} disabled={btnOn}>
            Ready
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
