/* eslint-disable*/
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// App - Chat 에서 가져온 socket, username, room
const RoomAndUsers = ({ socket, username, room, cnt }) => {
  // 방에 들어있는 유저들을 담을 곳
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomUsers2, setRoomUsers2] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("chatroom_users", (data) => {
      console.log(data);
      setRoomUsers(data);
    });

    socket.on("chatroom_users2", (data) => {
      console.log(data);
      setRoomUsers2(data);
    });

    // 언마운트시에 이벤트리스너 제거
    return () => socket.off("chatroom_users");
  }, [socket]);

  const leaveRoom = () => {
    socket.emit("leave_room", { username, room });
    navigate("/", { replace: true });
    // replace : true -> navigate의 주소로 가고난 후, 뒤로가기를 해도 방금의 페이지로 돌아가지 않음 자신의 메인페이지 "/"로 감 : 다시 방에 못 들어가게
  };

  return (
    <div className={styles.roomAndUsersColumn}>
      {/* Home에서 받아온 room이름 (input의 value값) */}
      <h2 className={styles.roomTitle}>{room}</h2>

      <>
        <div>
          {roomUsers.length >= 3 ? <h5 className={styles.usersTitle}>참가자:</h5> : <h5 className={styles.usersTitle}>대기자:</h5>}

          <ul className={styles.usersList}>
            {roomUsers.map((user) => (
              <li
                style={{
                  fontWeight: `${user.username === username ? "bold" : "normal"}`,
                }}
                key={user.id}
              >
                {user.username}
                <br />

                <p>점수 : {user.point}</p>
                <p>
                  누적승패 : {user.win}/{user.lose}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </>

      <div>
        <h3 className={styles.roomTitle}>⏱ : {cnt}</h3>
      </div>
      <button className="btn btn-danger" onClick={leaveRoom}>
        나가기
      </button>
    </div>
  );
};

export default RoomAndUsers;
