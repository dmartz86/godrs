let identify;
let messenger;
const channel = Rx.Observable.create(instance => identify = instance);
const notifier = Rx.Observable.create(instance => messenger = instance);
const socket = window.io();
let users = 0;

class Auth {
  constructor() {
    this.username = '';
  }

  getUserName() {
    return this.username;
  }

  setUserName(username) {
    identify.next({ type: 'identify', data: username });
    if (users === 2) {
      messenger.next({ type: 'notify', data: 'Waiting for opponent', level: 'info' });
    } else {
      messenger.next({ type: 'notify', data: 'Opponent is connected', level: 'success' });
    }

    this.username = username;
  }
}

class Main {
  constructor() {
    this.templateUrl = '/templates/main.html';
    this.controller = MainController;
    this.controllerAs = 'mn';
  }
}

class MainController {
  constructor(auth, $timeout) {
    this.auth = auth;
    this.$timeout = $timeout;
    this.listen();
  }

  listen() {
    channel.subscribe(message => {
      if (message.type === 'identify') {
        this.$timeout(() => this.username = message.data);
      }
    });
  }
}

class Login {
  constructor() {
    this.scope = { username: '=' };
    this.controller = LoginController;
    this.controllerAs = 'lc';
    this.templateUrl = '/templates/login.html';
  }
}

class LoginController {
  constructor(auth) {
    this.auth = auth;
  }

  identify() {
    this.auth.setUserName(this.username);
    socket.emit('join', { username: this.username });
  }
}

class RoundSelector {
  constructor() {
    this.scope = { username: '=' };
    this.controller = RoundSelectorController;
    this.controllerAs = 'rc';
    this.templateUrl = '/templates/rounds.html';
  }
}

class RoundSelectorController {
  constructor($scope, $http) {
    this.username = $scope.username;
    this.$http = $http;
    this.moves = [];
    this.setRound();
    this.getMoves();
    this.history = [];
    this.status = 'playing';
  }

  setRound(round = 1) {
    this.round = round;
  }

  getMoves() {
    this.$http.get('/moves')
      .then(res => this.moves = res.data);
  }

  setMove(move) {
    this.history[this.round] = move;
    messenger.next({ type: 'notify', data: '', level: 'info' });
  }

  confirmMove() {
    const move = this.history[this.round].move;
    this.round === 3 ? this.round = 1 : this.round++;
    const data = {
      message: `${this.username} has moved`,
      username: this.username,
      move: move
    };
    socket.emit('play', { type: 'notify', data: data, level: 'info' });
  }

  setStatus(status = 'playing') {
    this.status = status;
  }

  isActive(item) {
    const current = this.history[this.round];
    return current ? current.move === item.move : false;
  }

  hasSelectedAMove() {
    return !!this.history[this.round];
  }
}

class Score {
  constructor() {
    this.controller = ScoreController;
    this.controllerAs = 'sc';
    this.templateUrl = '/templates/score.html';
  }
}

class ScoreController {
  constructor($http) {
    this.$http = $http;
    this.onHistory();
  }

  onHistory() {
    socket.on('history', data => this.$http.post('/history', data));
  }
}

class NotifyArea {
  constructor() {
    this.controller = NotifyAreaController;
    this.controllerAs = 'nc';
    this.templateUrl = '/templates/notifications.html';
  }
}

class NotifyAreaController {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.listenRx();
    this.listenSocket();
  }

  listenRx() {
    notifier.subscribe(message => this.handleMessage(message));
  }

  listenSocket() {
    socket.on('message', message => this.handleMessage(message));
  }

  handleMessage(message) {
    // users | nowinner | winner
    if (message.flag && message.flag === 'users') {
      users = message.data;
    } else if (message.flag && message.flag === 'nowinner') {
      //TODO: what to show of we have no winner
      this.cleanMessages();
      this.info = 'No winner';
    } else if (message.type === 'notify') {
      this.cleanMessages();
      this.$timeout(() => this[message.level] = message.data);
    }
  }

  cleanMessages() {
    this.success = false;
    this.info = false;
    this.warning = false;
    this.danger = false;
  }
}

angular.module('godrsApp', [])
  .service('auth', Auth)
  .directive('main', Main)
  .directive('score', Score)
  .directive('notify', NotifyArea)
  .directive('rounds', RoundSelector)
  .directive('login', Login);