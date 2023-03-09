var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

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

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);
app.use("/chat", chatRouter)

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
    origin: ["http://192.168.1.5:3000", "http://localhost:3000", "http://192.168.1.108:3000", "http://192.168.1.37:3000", "http://192.168.1.19:3000"]
  }
});

/**
 * Start declaring chat pipeline
 */

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;
  const time = socket.handshake.query.timestamp;
  socket.join(username);
  console.log(
    `user ${socket.id} is connected! and has joined room ${username}`
  );
  console.log({ roomStatus: io.sockets.adapter.rooms });
  
  socket.on("send-chat", (payload) => {
    console.log({ roomStatus: io.sockets.adapter.rooms });
    console.log("event send-chat",payload);

    socket.broadcast.to(payload.receiverID).emit(`receive-chat`, payload);
  });

  socket.on("send-delete-notice", (payload) => {
    console.log("event send-delete-chat",payload);
    socket.broadcast.to(payload.receiverID).emit("receive-delete-notice", payload)
  })

  socket.on("send-read-notice", (payload) => {
    console.log("event send-read-notice",payload);
    socket.broadcast.to(payload.receiverID).emit("receive-read-notice", payload)
  })

  socket.on("send-notice-new-account", (payload) => {
    console.log("event send-notice-new-account", payload)
    socket.broadcast.emit("receive-notice-new-account", payload)
  })

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
