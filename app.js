var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors")
var io = require("socket.io")(3136, {
  cors: {
    origin: ['http://localhost:3000']
  }
})

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chatdb');
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter)

/**
 * Start declaring chat pipeline
 */

io.on("connection", socket => {
  console.log(`user ${socket.id} connected!`);
  socket.on("message", (message, userid) => {
    console.log(message, userid);
    socket.broadcast.emit("new-message", message)
  })
  
  socket.on("public-server", (id) => {
    console.log(id);
    socket.broadcast.emit("public-server", id)
  })

  socket.on("disconnect", message => {
    console.log(message);
  })
})

var debug = require('debug')('odm-chat-api:server');
var http = require('http');
const message = require('./models/message');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3036');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Create new socket.io server
 */

// var {Server} = require("socket.io")
// var io = new Server(server)

/**
 * Start declaring chat pipeline
 */

// io.on("connection", socket => {
//   console.log('socket connected!', socket.id);
// })

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

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
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
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
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
