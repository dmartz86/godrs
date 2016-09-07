class InvalidBlueMoveError extends Error { }
class InvalidRedMoveError extends Error { }
class EmptBoardError extends Error { }
class MissingIdError extends Error { }
class MissingRoundError extends Error { }
class MissingBoardError extends Error { }
class UnexpectedPlayersSizetError extends Error { }

module.exports = {
  InvalidBlueMoveError,
  InvalidRedMoveError,
  EmptBoardError,
  MissingIdError,
  MissingRoundError,
  MissingBoardError,
  UnexpectedPlayersSizetError
};