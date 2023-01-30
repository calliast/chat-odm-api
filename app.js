var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

/**
 * Example of socket.io config with dedicated IP
 */
// var io = require("socket.io")(3136, {
//   cors: {
//     origin: ["http://localhost:3000"],
//   },
// });

const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/chatdb");
}

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var apiRouter = require("./routes/api");
var chatRouter = require("./routes/chat")

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);
app.use("/chat", chatRouter)

/**
 * Start declaring chat pipeline
 */

// io.on("connection", (socket) => {
//   console.log(`user ${socket.id} connected!`);
//   socket.on("join-room", (room) => {
//     socket.join(room);
//     console.log(`User ${socket.id} has joined room ${room}`);
//     console.log(io.sockets.adapter.rooms, "cek");
//   });

//   socket.on("send-chat", (payload) => {
//     console.log(payload.message, payload.sentBy, payload.roomID);
//     if (payload.roomID.split("$_&_$").length === 1) {
//       socket.join(`${payload.sentBy}$_&_$${payload.roomID}`);
//       return socket.to(payload.roomID).emit(`receive-chat`, payload);
//     }
//     socket.to(payload.roomID).emit(`receive-chat`, payload);
//   });

//   socket.on("connect_error", (err) => {
//     console.log(`connect_error due to ${err.message}`);
//   });

//   socket.on("disconnect", (message) => {
//     console.log(message);
//   });
// });

var debug = require("debug")("odm-chat-api:server");
var http = require("http");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "3036");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Create new socket.io server
 */

var { Server } = require("socket.io");
var io = new Server(server, {
  cors: {
    origin: ["http://192.168.1.7:3000", "http://localhost:3000", "http://192.168.1.108:3000"]
  }
});

/**
 * Start declaring chat pipeline
 */

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;
  const time = socket.handshake.query.timestamp;
  console.log("🚀 ~ file: app.js:113 ~ io.on ~ time", time)
  socket.join(username);
  console.log(
    `user ${socket.id} is connected! and has joined room ${username}`
  );
  console.log({ roomStatus: io.sockets.adapter.rooms });
  
  socket.on("send-chat", (payload) => {
    console.log({ roomStatus: io.sockets.adapter.rooms });
    console.log(payload.message, payload.sentID);

    socket.broadcast.to(payload.receiverID).emit(`receive-chat`, payload);
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} has leave room ${room}`);
  });

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("disconnect", (message) => {
    console.log(`user ${socket.id} has disconnected`);
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
