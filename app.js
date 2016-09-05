const moves = require('./db.json').moves;
const path = require('path');
const express = require('express');
const util = require('util');
const jsonServer = require('json-server');
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const room = 'default';
const port = 1433;
const maxAttemps = 3;
let users = 0;
let history = [];
let playmate = {};

app.use(express.static(path.join(__dirname, '/public')));
app.use(middlewares);
app.use(router);
server.listen(port, () => util.log(`Listening on port ${port}`));

io.on('connection', socket => {
  let username = 'anonymous';
  users++;
  socket.join(room);
  socket.on('disconnect', () => {
    users--;
    socket.to(room).emit('message', { type: 'notify', data: `Opponent [${username}] has been disconnect`, level: 'warning' });
  });
  socket.on('join', (data) => {
    username = data.username;
    socket.to(room).emit('message', { flag: '', type: 'notify', data: `Opponent [${username}] has joined to the room`, level: 'info' });
  });
  socket.on('leave', () => socket.to(room).emit('message', { flag: '', type: 'notify', data: `Opponent [${username}] has leave the room`, level: 'warning' }));
  socket.on('play', (message) => {
    if (playmate[message.data.username]) {
      socket.emit('message', { type: 'notify', data: `Opponent [${username}] sent twice the request`, level: 'danger' });
      return socket.to(room).emit('message', { type: 'notify', data: `Opponent [${username}] sent twice the request`, level: 'danger' });
    }

    playmate[message.data.username] = message;

    const players = Object.keys(playmate);
    if (players.length === 2) {

      let rule;
      let level;
      const firstPlayer = playmate[players[0]].data;
      const secondplayer = playmate[players[1]].data;

      if (firstPlayer.move === secondplayer.move) {
        socket.emit('message', { type: 'notify', data: `No winner, both move ${firstPlayer.move}`, level: 'info' });
        socket.to(room).emit('message', { type: 'notify', data: `No winner, both move ${firstPlayer.move}`, level: 'info' });
      }

      rule = moves.find(item => item.move == firstPlayer.move);
      if (rule.kills === secondplayer.move) {
        level = firstPlayer.username === username ? 'warning' : 'success';
        socket.to(room).emit('message', { flag: 'winner', type: 'notify', data: `Opponent [${firstPlayer.username}] won`, level: level });
        socket.emit('message', { type: 'notify', data: 'You won!!', level: 'success' });
      }

      rule = moves.find(item => item.move == secondplayer.move);
      if (rule.kills === firstPlayer.move) {
        level = secondplayer.username === username ? 'warning' : 'success';
        socket.to(room).emit('message', { flag: 'winner', type: 'notify', data: `Opponent [${secondplayer.username}] won`, level: level });
        socket.emit('message', { type: 'notify', data: 'You won!!', level: 'success' });
      }

      history.push(playmate);
      playmate = {};

      if (history.length === maxAttemps) {
        socket.to(room).emit('history', { history: history });
        history = [];
      }
    } else {
      socket.to(room).emit('message', { type: 'notify', data: `Opponent [${username}] has moved`, level: 'info' });
    }
  });
  socket.to(room).emit('message', { flag: 'users', type: 'notify', data: users, level: 'info' });
});