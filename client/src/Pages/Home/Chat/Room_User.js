import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// App - Chat 에서 가져온 socket, username, room
const RoomAndUsers = ({ socket, username, room }) => {
  // 방에 들어있는 유저들을 담을 곳
  const [roomUsers, setRoomUsers] = useState([]);

  const navigate = useNavigate();

  // [socket이 바뀔 때마다 실행] socket.on 이벤트리스너 배열을 통해 서버로부터 유저들 정보에 받아와서 유저들 정보에 저장
  useEffect(() => {
    socket.on("chatroom_users", (data) => {
      console.log(data);
      setRoomUsers(data);
    });

    // 언마운트시에 이벤트리스너 제거
    return () => socket.off("chatroom_users");
  }, [socket]);

  // 방 떠날시에 유저이름, 방정보, 혀재시간을 담아서 보냄
  const leaveRoom = () => {
    const 현재시간 = Date.now();
    socket.emit("leave_room", { username, room, 현재시간 });
    // 나가면 홈으로
    navigate("/", { replace: true });
    // replace : true -> navigate의 주소로 가고난 후, 뒤로가기를 해도 방금의 페이지로 돌아가지 않음 자신의 메인페이지 "/"로 감 : 다시 방에 못 들어가게
  };

  return (
    <div className={styles.roomAndUsersColumn}>
      {/* Home에서 받아온 room이름 (input의 value값) */}
      <h2 className={styles.roomTitle}>{room}</h2>

      <div>
        {roomUsers.length > 0 && <h5 className={styles.usersTitle}>Users:</h5>}
        <ul className={styles.usersList}>
          {roomUsers.map((user) => (
            // 내가 입력한 Username이 지금 내 이름이라면 bold
            <li
              style={{
                fontWeight: `${user.username === username ? "bold" : "normal"}`,
              }}
              key={user.id}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <button className="btn btn-danger" onClick={leaveRoom}>
        나가기
      </button>
    </div>
  );
};

export default RoomAndUsers;
