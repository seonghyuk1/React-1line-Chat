const express = require("express");
const app = express();
http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

//리액트 연결 path
const path = require("path");
const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "./client/build");
app.use(express.static(buildPath));
app.use(cors());
{
  /* io.emit  : 접속해있는 모든 유저들에게 */
}
{
  /* socket.emit  : 메세지를 전송한 유저에게만 */
}
{
  /* socket.broadcast.emit  : 메세지를 전송한 애를 제외한 나머지 */
}
{
  /* io.to(id).emit  : 지정된 특정 유저에게만 */
}

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

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} 유저가 연결 되었습니다.`);

  // 방에 들어올 때 마다
  socket.on("join_room", (data) => {
    // 서버로부터 들어온 username과 room (1호선) 방정보
    const { username, room } = data;
    // join으로 채팅방에 합류
    socket.join(room);

    // 현재 시간
    let 현재시간 = Date.now();

    // 운영자 - 방에다가 전체공지
    socket.to(room).emit("receive_message", {
      message: `⚡: ${username}가 방에 참가하였습니다.`,
      username: CHAT_BOT,
      현재시간,
    });

    // 운영자 - 채팅방에 막 들어와 메세지를 발생시킨 애한테 환영인사
    socket.emit("receive_message", {
      message: `환영합니다 ${username}님!`,
      username: CHAT_BOT,
      현재시간,
    });

    // 현재 들어와있는 방을 chatRoom에 저장, 모든유저 배열에 socket.id, 닉네임, 방정보 저장
    chatRoom = room;
    모든유저.push({ id: socket.id, username, room });

    // 들어와있는 방이 같다면 그 유저들로 chatRoomusers라는 배열 구성
    chatRoomUsers = 모든유저.filter((user) => user.room === room);
    // 방에 들어와있는 유저들에게만 보이게 참가자 목록 보여주기
    socket.to(room).emit("chatroom_users", chatRoomUsers);
    // ??
    socket.emit("chatroom_users", chatRoomUsers);

    // *메세지전송* 누군가 메세지를 보내면 방안에다가 한 말, 사용자이름, 방정보, 시간 담아 뿌리기 (내가 보내면 내가 쓴 닉네임으로)
    socket.on("send_message", (data) => {
      const { message, username, room, 현재시간 } = data;
      // 그 후 받는 메세지에게 전체다 뿌려줌
      io.in(room).emit("receive_message", data);
    });

    // *방 나갈 때 *
    socket.on("leave_room", (data) => {
      const { username, room } = data;
      //  join으로 들어온 방 나가기
      socket.leave(room);
      // 나간 애의 socketID를 전달하여 걔 빼고 남은 애들로만 배열 구성 (filter)
      모든유저 = leaveRoom(socket.id, 모든유저);

      // 그 후 채팅방에 들어있는 애들에게 전체 공지
      socket.to(room).emit("chatroom_users", 모든유저);
      // 운영자 이름으로 누가 나갔다고 전체공지
      socket.to(room).emit("receive_message", {
        username: CHAT_BOT,
        message: `${username}가 방을 떠났습니다.`,
        현재시간,
      });
      // 서버에 찍어보기
      console.log(`${username}가 방을 떠났습니다.`);
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

    // 남은 유저들의 정보와 유저들 수 확인
    console.log(모든유저);
    console.log(모든유저.length);
  });
});

// 리액트 연결
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

server.listen(80, () => console.log("80에서 돌아가는 중!"));
