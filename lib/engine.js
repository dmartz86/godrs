const errors = require('./errors');

module.exports = class Engine {
  constructor(rules) {
    this.rules = rules;
  }

  winner(moveBlue, moveRed) {
    if (!moveBlue) { throw new errors.InvalidBlueMoveError(); }
    if (!moveRed) { throw new errors.InvalidRedMoveError(); }

    const rule = this.rules
      .find(rule => rule.move === moveBlue);
    const won = rule ? rule.kills === moveRed : false;
    const result = moveBlue === moveRed ? won : false;
    return { blue: result, red: !result };
  }

  summary(history = {}) {
    if (!history.id) { throw new errors.MissingIdError(); }
    if (history.round !== 3) { throw new errors.MissingRoundError(); }
    if (!history.board) { throw new errors.MissingBoardError(); }
    if (history.board.length !== 2) { throw new errors.UnexpectedPlayersSizetError(); }

    const blue = history.board[0];
    const red = history.board[1];
    const results = [];
    results.push(this.winner(blue.moves[0], red.moves[0]));
    results.push(this.winner(blue.moves[1], red.moves[1]));
    results.push(this.winner(blue.moves[2], red.moves[2]));

    return results;
  }
};