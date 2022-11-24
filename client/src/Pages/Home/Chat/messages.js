// 받은 메세지
import styles from "./styles.module.css";
import { useState, useEffect } from "react";

// App - Chat에서 가져온 socket
// 서버로부터 들어온 메세지들을 (내가 보낸 거 포함) 갖고 뿌려주기만 하는 애라 socket만 그저 틀
const Messages = ({ socket }) => {
  // 받은 메세지 저장소
  const [messagesRecieved, setMessagesReceived] = useState([]);

  // [socket이 바뀔 때마다 실행] socket.on 이벤트리스너 배열을 통해 서버로부터 메세지 받고 들어올 때마다 재구성
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data);
      // 비구조화 할당으로 들어올 애들을 합침
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          현재시간: data.현재시간,
        },
      ]);
    });

    // 언마운트시에 이벤트 리스너 제거
    return () => socket.off("receive_message");
  }, [socket]);

  // 시간 형식 지정 년, 월, 일 시분초
  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <div className={styles.messagesColumn}>
      {/* msg -> 위 useEffect를 통해 서버로부터 받아온 데이터들 */}
      {messagesRecieved.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>{formatDateFromTimestamp(msg.현재시간)}</span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};

export default Messages;
