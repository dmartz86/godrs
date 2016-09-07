const assert = require('assert');
const rules = require('../db.json').moves;
const Engine = require('../lib/engine');
const errors = require('../lib/errors');

describe('Engine', () => {

  it('should create a summary', () => {
    const engine = new Engine(rules);
    const history = {
      id: 1,
      round: 3,
      board: [
        { name: 'blue', moves: ['paper', 'paper', 'paper'] },
        { name: 'red', moves: ['rock', 'scissors', 'paper'] }
      ]
    };

    const result = engine.summary(history);
    const expected = [
      { blue: false, red: true },
      { blue: false, red: true },
      { blue: false, red: true }
    ];

    assert.strictEqual(result[0].red, expected[0].red);
    assert.strictEqual(result[0].red, expected[0].red);
    assert.strictEqual(result[0].red, expected[0].red);
    assert.strictEqual(result[0].blue, expected[0].blue);
    assert.strictEqual(result[0].blue, expected[0].blue);
    assert.strictEqual(result[0].blue, expected[0].blue);
  });

  describe('should thow error on unexpected inputs', () => {
    const engine = new Engine(rules);

    it('case MissingIdError', () => assert.throws(() => engine.summary(), error => error instanceof errors.MissingIdError));
    it('case MissingIdError', () => assert.throws(() => engine.summary({id: 0}), error => error instanceof errors.MissingIdError));
    it('case MissingRoundError', () => assert.throws(() => engine.summary({id: 1}), error => error instanceof errors.MissingRoundError));
    it('case MissingBoardError', () => assert.throws(() => engine.summary({id: 1, round: 3}), error => error instanceof errors.MissingBoardError));
    it('case MissingRoundError', () => assert.throws(() => engine.summary({id: 1, round: 4}), error => error instanceof errors.MissingRoundError));
    it('case UnexpectedPlayersSizetError', () => assert.throws(() => engine.summary({id: 1, round: 3, board: []}), error => error instanceof errors.UnexpectedPlayersSizetError));

  });

});