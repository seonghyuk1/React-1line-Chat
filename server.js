const express = require("express");
const app = express();
http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const path = require("path");
const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "./client/build");
app.use(express.static(buildPath));
app.use(cors());

const server = http.createServer(app);

// 사용자 나감 함수 -> 사용자가 나가면 받아온 userID는 빼고 남은 애들로 chatRoomuser에 재구성
function leaveRoom(userID, chatRoomUsers) {
  return chatRoomUsers.filter((user) => user.id != userID);
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//공지용 username 설정
const CHAT_BOT = "운영자";

// 우리가 선택한 채팅방
let chatRoom = "";

// 모든 유저를 담을 배열
let 모든유저 = [];
let 유저카운트 = [];
let 관전유저 = [];

let point = 0;
let win = 0;
let lose = 0;

let ANSWERS = [];
let 게임했던사람들;

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} 유저가 연결 되었습니다.`);

  socket.on("count", (data) => {
    유저카운트.push(data);
    socket.emit("count", 유저카운트);
  });

  // 방에 들어올 때 마다
  socket.on("join_room", (data) => {
    const { username, room } = data;
    // 채팅방 합류

    socket.join(room);

    chatRoom = room;
    유저카운트.length < 4 && 모든유저.push({ id: socket.id, username, room, win, lose, point });

    // 관전유저가 들어와서 유저카운트의 길이가 4가 되면 관전유저 배열에 관전유저 삽입 후 유저카운트 마지막 애 제거
    유저카운트.length >= 4 && (관전유저.push({ id: socket.id, username, room, win, lose, point }), 유저카운트.pop());

    // 관전자 땡겨와서 게임 시작
    // (모든유저.length < 3) & (관전유저.length >= 1) && 모든유저.push(관전유저.shift());

    // 들어와있는 방이 같다면 그 유저들로 chatRoomusers라는 배열 구성
    chatRoomUsers = 모든유저.filter((user) => user.room === room);

    //관전유저들은 따로 보관
    관전유저.filter((user) => user.room === room);

    console.log("유저카운트 초반", 유저카운트);
    console.log("모든유저 초반", 모든유저);
    console.log("관전유저 초반", 관전유저);

    socket.to(room).emit("chatroom_users", chatRoomUsers);

    socket.emit("chatroom_users", chatRoomUsers);

    socket.emit("chatroom_users2", 관전유저);

    // receive에 접근하면 send가 초기화 되므로 피해 안주기
    관전유저.length == 0 &&
      socket.to(room).emit("receive_message", {
        message: `⚡: ${username}가 방에 참가하였습니다.`,
        username: CHAT_BOT,
      });

    if (관전유저.length > 0) {
      // 관전
      socket.to(room).emit("VIEW", {
        message: `⚡: ${username}가 관전중.`,
        username: CHAT_BOT,
      }),
        socket.emit("VIEW", {
          message: `환영합니다 ${username}님! 관전만 가능합니다.`,
          username: CHAT_BOT,
        });
    } else if (유저카운트.length < 3) {
      socket.emit("receive_message", {
        message: `환영합니다 ${username}님! 참가자가 3명일 때 시작합니다.`,
        username: CHAT_BOT,
      });

      // 유저카운트 길이가 3명일 때만 게임 진행함
    } else if (유저카운트.length == 3) {
      // 상시
      socket.on("countdownbtn", (data) => {
        console.log("차례 :", data);

        console.log("유카", 유저카운트);
        게임했던사람들 = 모든유저;
        console.log("모든유저", 모든유저);

        let isStop = false;
        let counter = 10;
        let rand;
        // 3명이면 3명내에서만 반복하고 관전자가 있을시엔 관전자들 제외 후 반복
        유저카운트.length <= 3 ? (rand = Math.floor(Math.random() * 유저카운트.length)) : (rand = Math.floor(Math.random() * 유저카운트.length - 유저카운트.splice(3).length));
        let rValue = 유저카운트[rand];

        const cdb = setInterval(() => {
          if (!isStop) {
            if (counter == 0) {
              console.log("턴 종료!");
              clearInterval(cdb);
              // 0이라면 isStart 보내 다시 카운트 실시
              io.emit("receive_message", {
                message: `✨ ${rValue}의 차례 ✨`,
                username: rValue,
                isStart: "Y",
              });

              // 3명 일 때만 점수계산 진행
              if (모든유저.length == 3) {
                let 답안한사람 = 모든유저.find((e) => e.username === data.username);
                답안한사람.lose++;

                let 답안한애빼고 = 모든유저.filter((e) => e.username != data.username);
                답안한애빼고.map((v) => {
                  v.point++;
                  v.win++;
                });
                io.emit("chatroom_users", 모든유저);
              }
            } else {
              counter--;
              io.emit("countdown", { number: `${counter}` });
              console.log(counter);

              socket.on("countdownstopbtn", () => {
                isStop = true;
                counter = 10;
              });

              {
                모든유저.length < 3 && (isStop = true);
              }
            }
          } else {
            // 정답이 들어왔다면 isStop이 true로 바뀌니까
            // 앞에 있던 타이머 지우고 다시 카운트
            clearInterval(cdb);
            // 3명이 아니라면 게임을 중지하고 3이라면 계속 카운트
            if (모든유저.length < 3) {
              io.emit("receive_message", {
                message: `🎇참가자가 나가서 게임 끝! 결과창으로 이동하겠습니다.🎇`,
                username: CHAT_BOT,
              }),
                io.emit("receive_message", {
                  message: `🎇결과창을 불러옵니다.🎇`,
                  username: CHAT_BOT,
                }),
                io.emit("receive_message", {
                  message: `🎇다시하기나 나가기를 선택하여주세요.🎇`,
                  username: CHAT_BOT,
                });
            } else if (모든유저.length == 4) {
              io.emit("receive_message", {
                message: `🎇모든 역 다 맞춰서 게임 끝! 결과창으로 이동하겠습니다.🎇`,
                username: CHAT_BOT,
              }),
                io.emit("receive_message", {
                  message: `🎇결과창을 불러옵니다.🎇`,
                  username: CHAT_BOT,
                }),
                io.emit("receive_message", {
                  message: `🎇다시하기나 나가기를 선택하여주세요.🎇`,
                  username: CHAT_BOT,
                });
            } else if (모든유저.length == 3) {
              io.emit("receive_message", {
                message: `✨ ${rValue}의 차례 ✨`,
                username: rValue,
                isStart: "Y",
              });
            }

            모든유저.length != 3 &&
              (setTimeout(() => {
                게임했던사람들.map((v, i) => {
                  io.emit("receive_message", {
                    message: `참가자명 : ${게임했던사람들[i].username} ✨ 점수 : ${게임했던사람들[i].point} 승/패 : ${게임했던사람들[i].win}/${게임했던사람들[i].lose}  `,
                    username: "결과",
                  });
                });
              }, 3000),
              io.emit("receive_message", {
                message: `참가자를 기다리는 중`,
                username: CHAT_BOT,
                isStart: "N",
              }));
            // io.emit("count", { isEnd: "Y" })
          }
        }, 1000);
      });

      // 1번 실행
      setTimeout(() => {
        io.emit("receive_message", {
          message: `이제 참가자가 3명이므로 게임을 시작합니다.`,
          username: CHAT_BOT,
        });

        io.emit("receive_message", {
          message: ` 지금부터 게임시작!`,
          username: CHAT_BOT,
        });

        let rand = Math.floor(Math.random() * 유저카운트.length);
        let rValue = 유저카운트[rand];

        io.emit("receive_message", {
          message: `✨ ${rValue}의 차례 ✨`,
          username: rValue,
          isStart: "Y",
        });

        io.emit("firstTurn", {
          username: rValue,
        });
      }, 100);
    }

    // *메세지전송* 누군가 메세지를 보내면 방안에다가 한 말, 사용자이름, 방정보, 시간 담아 뿌리기 (내가 보내면 내가 쓴 닉네임으로)
    socket.on("send_message", (data) => {
      // 그 후 받는 메세지에게 전체다 뿌려줌

      console.log(data.isAnswer);

      // 오답시
      if (station.indexOf(data.message) === -1) {
        data.isAnswer = "오답!💦";
        io.in(room).emit("receive_message", data);

        let 오답한사람 = 모든유저.find((e) => e.username === data.username);
        오답한사람.lose++;

        let 오답한사람빼고 = 모든유저.filter((e) => e.username != data.username);
        오답한사람빼고.map((v) => {
          v.point++;
          v.win++;
        });

        io.emit("chatroom_users", 모든유저);
      } else if (ANSWERS.indexOf(data.message) != -1) {
        data.isAnswer = "이미 있는 답!💦";
        io.in(room).emit("receive_message", data);

        let 오답한사람 = 모든유저.find((e) => e.username === data.username);
        오답한사람.lose++;

        let 오답한사람빼고 = 모든유저.filter((e) => e.username != data.username);
        오답한사람빼고.map((v) => {
          v.point++;
          v.win++;
        });

        io.emit("chatroom_users", 모든유저);
      } else {
        // 정답시
        data.isAnswer = "★정답!★";
        io.in(room).emit("receive_message", data);

        ANSWERS.push(data.message);
        {
          ANSWERS === station && 모든유저.push({ username: "운영자", point: "∞", win: "∞", lose: "∞" });
          // 모든 역 다 말하면 운영자를 추가하여 길이를 4로 바꾸어 게임 중지
        }
      }
    });

    // *방 나갈 때 *
    socket.on("leave_room", (data) => {
      const { username, room } = data;
      //  join으로 들어온 방 나가기
      socket.leave(room);
      // 나간 애의 socketID를 전달하여 걔 빼고 남은 애들로만 배열 구성
      모든유저 = leaveRoom(socket.id, 모든유저);

      // 그 후 채팅방에 들어있는 애들에게 전체 공지
      socket.to(room).emit("chatroom_users", 모든유저);
      // 운영자 이름으로 누가 나갔다고 전체공지
      socket.to(room).emit("receive_message", {
        username: CHAT_BOT,
        message: `${username}가 방을 떠났습니다.`,
      });
      // 서버에 찍어보기
      console.log(`${username}가 방을 떠났습니다.`);

      console.log("후반", 관전유저);
      let 남은유저 = 모든유저.filter((e) => e.username != data.username);

      // 남은 애들을 모든유저와 유저카운트에 넣어주고
      유저카운트 = 남은유저;
      모든유저 = 남은유저;

      console.log("후반 유카", 유저카운트);
      console.log("후반 모유", 모든유저);
    });

    // 유저 연결 끊겼을 때
    socket.on("disconnect", () => {
      console.log(`🥐: ${socket.id} 유저연결 해제!`);
      // 모든 유저들에 들어있던 user가 방금 나간애랑 같다면 -> 나간애 지정
      const user = 모든유저.find((user) => user.id == socket.id);
      // 방금 나간애 이름이 이 socket.id라면 걔 빼고 Chatroom_users에게 남은 유저들로 구성함을 알림
      if (user?.username) {
        모든유저 = leaveRoom(socket.id, 모든유저);
        socket.to(chatRoom).emit("chatroom_users", 모든유저);
        // 나머지 애들한테 방금 나간 애 연결 끊겼다고 선언
        socket.to(chatRoom).emit("receive_message", {
          message: `🥐: ${user.username}의 연결이 종료 되었습니다!`,
        });
      }
    });
  });
});

// 정답들
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

// 리액트 연결
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

server.listen(80, () => console.log("80에서 돌아가는 중!"));
