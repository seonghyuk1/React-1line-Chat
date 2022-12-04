import styles from "./styles.module.css";
import MessagesReceived from "./messages.js";
import SendMessage from "./sendMessage";
import RoomAndUsers from "./Room_User";

// 게임화면
// App으로부터 가져온 socket, username, room
const Result = ({ socket, username, room, cnt, setCnt }) => {
  return (
    <div className={styles.chatContainer}>
      <RoomAndUsers socket={socket} username={username} room={room} cnt={cnt} setCnt={setCnt} />
      <div>
        <MessagesReceived socket={socket} cnt={cnt} setCnt={setCnt} />
        <SendMessage socket={socket} username={username} room={room} />
      </div>
    </div>
  );
};

export default Result;
