import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

function Home({ username, setUsername, room, setRoom, socket }) {
  const navigate = useNavigate();
  const joinRoom = () => {
    // 선택한 방이 공백이 아니고 닉네임이 공백이 아니면 join_room에 요청하여 방에 참가시킴
    if (room !== "" && username !== "") {
      socket.emit("join_room", { username, room });
    }
    navigate("/chat", { replace: true });
    // replace : true -> navigate의 주소로 가고난 후, 뒤로가기를 해도 방금의 페이지로 돌아가지 않음 자신의 메인페이지 "/"로 감 : 다시 방에 못 들어가게
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h3>성혁이가 좋아하는 랜덤게임</h3>
        <input className={styles.input} placeholder="닉네임 입력" onChange={(e) => setUsername(e.target.value)} />

        <select className={styles.input} onChange={(e) => setRoom(e.target.value)}>
          <option>게임선택</option>
          <option value="1호선게임">1호선</option>
        </select>

        <button className="btn btn-secondary" style={{ width: "100%" }} onClick={joinRoom}>
          Ready
        </button>
      </div>
    </div>
  );
}

export default Home;
