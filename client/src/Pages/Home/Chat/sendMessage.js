/* eslint-disable*/
import styles from "./styles.module.css";
import React, { useState, useEffect } from "react";

// App - Chat을 통해 가져온 socket, username, room
const SendMessage = ({ socket, username, room }) => {
  let [turn, setTurn] = useState(true);
  const [message, setMessage] = useState("");
  let isAnswer;
  let [isRes, setIsRes] = useState(false);

  useEffect(() => {
    socket.on("firstTurn", (data) => {
      data.username === sessionStorage.getItem("username") ? setTurn(false) : setTurn(true);
    });

    socket.on("receive_message", (data) => {
      data.username === sessionStorage.getItem("username") ? setTurn(false) : setTurn(true);
    });
  });

  const sendMessage = () => {
    socket.emit("countdownstopbtn");
    // 답하면 꺼줬다가 자기차례에 다시 켜주기
    socket.on("countdown", (data) => {
      data.number == 9 && setIsRes(false);
    });
    if (message) {
      // 누군가 말을 하면 서버로 보냄, 단 여기서 누가 보냈는지 특정할 수 없고 서버에서 socket.id 비교 하여 결정
      socket.emit("send_message", { username, room, message, isAnswer });

      setMessage("");
      setIsRes(true);
    } else {
      alert("빈 텍스트는 보낼 수 없습니다.");
    }
  };

  // input에 onkeypress함수 등록
  const handleOnKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage(); // Enter 입력이 되면 클릭 이벤트 실행
    }
  };
  return (
    <>
      {!isRes ? (
        <div className={styles.sendMessageContainer}>
          <input className={styles.messageInput} placeholder="메세지를 입력하세요..." onChange={(e) => setMessage(e.target.value)} value={message} onKeyPress={handleOnKeyPress} disabled={turn} />
          <button className="btn btn-info" onClick={sendMessage} disabled={turn}>
            보내기
          </button>
        </div>
      ) : (
        <div className={styles.sendMessageContainer}>
          <input className={styles.messageInput} placeholder="메세지를 입력하세요..." onChange={(e) => setMessage(e.target.value)} value={message} onKeyPress={handleOnKeyPress} disabled />
          <button className="btn btn-info" onClick={sendMessage} disabled>
            보내기
          </button>
        </div>
      )}
    </>
  );
};

export default SendMessage;
