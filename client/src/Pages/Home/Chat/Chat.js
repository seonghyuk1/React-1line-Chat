import styles from "./styles.module.css";
import MessagesReceived from "./messages.js";
import SendMessage from "./sendMessage";
import RoomAndUsers from "./Room_User";

// App으로부터 가져온 socket, username, room
const Chat = ({ socket, username, room }) => {
  return (
    <div className={styles.chatContainer}>
      <RoomAndUsers socket={socket} username={username} room={room} />
      <div>
        <MessagesReceived socket={socket} />
        <SendMessage socket={socket} username={username} room={room} />
      </div>
    </div>
  );
};

export default Chat;
