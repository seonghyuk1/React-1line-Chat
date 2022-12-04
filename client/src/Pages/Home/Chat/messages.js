/* eslint-disable*/
import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";

// App - Chat에서 가져온 socket
const Messages = ({ socket, setCnt, username, room }) => {
  // 받은 메세지 저장소
  const [messagesRecieved, setMessagesReceived] = useState([]);
  let ANSWERS = [];
  let [again, setAgain] = useState("");

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data);
      // 비구조화 할당으로 들어올 애들을 합침
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          isStart: data.isStart,
          isAnswer: data.isAnswer,
        },
      ]);

      //2번째 방법
      data.isStart == "Y" && socket.emit("countdownbtn", data);
      data.isStart == "N" && setAgain("W");
      data.isAnswer && socket.emit("countdownstopbtn");

      socket.on("countdown", (data) => {
        setCnt(data.number);
      });
    });

    // 관전
    socket.on("VIEW", (data) => {
      console.log(data);
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
        },
      ]);
    });

    // 언마운트시에 이벤트 리스너 제거
    return () => socket.off("receive_message");
  }, [socket]);

  return (
    <div className={styles.messagesColumn}>
      {messagesRecieved.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className={styles.msgMeta}>{msg.username}</span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
          <h2 className={styles.msgText}>{msg.isAnswer}</h2>
          {msg.isAnswer == "★정답!★" && ANSWERS.push(msg.message + ", ")}
        </div>
      ))}
      {ANSWERS.length != 0 && (
        <h5 className={styles.msgText}>
          {" "}
          <b>누적답안 : {ANSWERS}</b>{" "}
        </h5>
      )}
      {again == "W" && (
        <button
          className="btn btn-secondary"
          onClick={(e) => {
            socket.emit("join_room", { username, room });
            e.preventDefault();
            alert("상대방 선택기다리는 중");
          }}
        >
          다시하기
        </button>
      )}
    </div>
  );
};

export default Messages;

// ========= 커스텀 훅 ==========
// const useInterval = (callback, delay) => {
//   const savedCallback = useRef(null);

//   useEffect(() => {
//     savedCallback.current = callback;
//   }, [callback]);

//   useEffect(() => {
//     const executeCallback = () => {
//       savedCallback.current();
//     };

//     const timerId = setInterval(executeCallback, delay);

//     return () => clearInterval(timerId);
//   }, []);
// };

// 10초마다 countdownbtn 요청 | countdown 요청 받기
// useInterval(() => {
//   socket.emit("countdownbtn", number);
//   socket.on("countdown", (data) => {
//     setNumber(data.number);
//     console.log(data.number);
//   });
// }, 10000);

let station = [
  "탕정",
  "신창",
  "대방",
  "회기",
  "신길",
  "봉명",
  "녹천",
  "쌍용",
  "온양온천",
  "노량진",
  "영등포",
  "외대앞",
  "신이문",
  "석계",
  "광운대",
  "월계",
  "창동",
  "신도림",
  "용산",
  "배방",
  "구로",
  "가산디지털단지",
  "금천구청",
  "석수",
  "안양",
  "명학",
  "군포",
  "성균관대",
  "화서",
  "수원",
  "독산",
  "세류",
  "오산대",
  "오산",
  "진위",
  "송탄",
  "남영",
  "금정",
  "서정리",
  "평택",
  "성환",
  "직산",
  "천안",
  "광명",
  "오류동",
  "역곡",
  "부천",
  "송내",
  "부평",
  "동암",
  "동인천",
  "인천",
  "소사",
  "간석",
  "관악",
  "주안",
  "구일",
  "부개",
  "도원",
  "온수",
  "중동",
  "도화",
  "아산",
  "당정",
  "방학",
  "도봉",
  "망월사",
  "회룡",
  "의정부",
  "의왕",
  "병점",
  "두정",
  "서동탄",
  "제물포",
  "양주",
  "덕계",
  "덕정",
  "지행",
  "동두천중앙",
  "동두천",
  "세마",
  "평택지제",
  "개봉",
  "백운",
  "도봉산",
  "소요산",
  "가능",
  "녹양",
  "보산",
  "서울역",
  "시청",
  "종각",
  "종로3가",
  "종로5가",
  "동대문",
  "신설동",
  "제기동",
  "청량리",
  "동묘앞",
];
