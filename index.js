const express = require("express");
const app = express();

const player = require("node-wav-player");

const localPort = 8383; //This is a port used when deploying the app on local machine.
const port = process.env.PORT || localPort; //This is the final port - local (look higher) or auto (when on the hosting service)

//Libraries requied for opening the site
const open = require("open");
const ip = require("ip");

const server = app.listen(port, () => {
  //Displaying a message about starting
  console.log(`[${formatDate(new Date())}] App has started on port ${port}!`);
});

const room = "default";

let lastMessage = "";
let lastName = "";

console.clear();

//Set the static path to the path of the site
app.use(express.static("./build/"));

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/build/index.html");
});

const io = require("socket.io")(server); //Sending messages to receiver
const socket = require("socket.io-client")("http://10.249.20.105:8500", {
  query: `type=komputer&room=${room}`,
}); //Receiving calls from sender

socket.on("calling", async (data) => {
  console.log(
    `[${formatDate(new Date())}] Called` +
      (data.message !== "" ? ` with message ${data.message}` : "")
  );
  lastMessage = data.message;
  lastName = data.name;
  //Opening site which allows you to turn off the music
  await open(`http://${ip.address()}:${port}`);

  //Play the song
  player.play({
    path: "./song.wav",
  });

  //Send new status to the caller
  socket.emit("statusUpdate", {
    toSender: true,
    status: "received",
    room: room,
  });
});

socket.on("message", (content) => {
  //Forward the message to the site
  io.sockets.emit("messageReply", content);
});

socket.on("statusUpdate", (newStatus) => {
  if (newStatus === "end") {
    io.sockets.emit("end");
  }
});

io.on("connection", (client) => {
  client.emit("message", lastMessage);
  client.on("end", () => {
    //Mute the song
    player.stop();
    socket.emit("statusUpdate", {
      toSender: true,
      status: "end",
      room: room,
    });
    console.log(`[${formatDate(new Date())}] The call has ended`);
  });
  client.on("mute", () => {
    //Mute the song
    player.stop();
    //Update the status
    socket.emit("statusUpdate", {
      toSender: true,
      status: "read",
      room: room,
    });
    console.log(`[${formatDate(new Date())}] Muted the song`);
  });

  //When user enters the message writing site, notify the sender
  client.on("writingMessage", () => {
    socket.emit("statusUpdate", {
      toSender: true,
      status: "writingMessage",
      room: room,
    });
  });

  client.on("sendMessage", (message) => {
    socket.emit("message", {
      toSender: true,
      message: message,
      room: room,
    });
  });

  client.on("getMessage", () => {
    if (lastMessage) {
      client.emit("message", { message: lastMessage, name: lastName });
    }
  });
});

//Format a date into HH:MM DD.MM.YYYY format.
function formatDate(date) {
  return `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  }:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()} ${
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
  }.${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }.${date.getFullYear()}`;
}
