import styles from "./styles.module.css";
import React, { useState } from "react";

// App - Chat을 통해 가져온 socket, username, room
const SendMessage = ({ socket, username, room }) => {
  // 보낼 말들을 위한 massage
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message !== "") {
      const 현재시간 = Date.now();
      // 누군가 말을 하면 서버로 보냄, 단 여기서 누가 보냈는지 특정할 수 없고 서버에서 socket.id 비교 하여 결정
      socket.emit("send_message", { username, room, message, 현재시간 });
      // 보내고 나면 늘 공백처리 ~
      setMessage("");
    }
  };

  // input에 onkeypress함수 등록
  const handleOnKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage(); // Enter 입력이 되면 클릭 이벤트 실행
    }
  };
  return (
    <div className={styles.sendMessageContainer}>
      {/* onChange로 바뀔 때 마다 입력 받고 바뀐 message를 value로 전달 */}
      <input className={styles.messageInput} placeholder="메세지를 입력하세요..." onChange={(e) => setMessage(e.target.value)} value={message} onKeyPress={handleOnKeyPress} />
      {/* <input type="text" class="form-control" placeholder="메세지를 입력하세요..." onChange={(e) => setMessage(e.target.value)} value={message} onKeyPress={handleOnKeyPress} /> */}
      {/* 버튼 누르면 메세지 보내기 */}
      <button className="btn btn-info" onClick={sendMessage}>
        정답 보내기
      </button>
    </div>
  );
};

export default SendMessage;
