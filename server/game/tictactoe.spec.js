'use strict';

var should = require('should');
var Game = require('./tictactoe');

describe('Game', function() {
  var game;
  var id = 'testId';
  var player1 = 'player1';
  var player2 = 'player2';

  beforeEach(function() {
    game = new Game(id, player1, player2);
  });

  it('should be constructed correctly.', function(done) {
    game.id.should.equal(id);
    game.board.should.eql([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    game.moves.should.be.empty;
    game.players.should.eql([player1, player2]);
    game.should.have.property('startingOffset').within(0, 1);
    game.status.should.equal('playing');
    done();
  });

  describe('nextMark', function() {
    it('should return 1 for empty board.', function(done) {
      game.nextMark().should.equal(1);
      done();
    });

    it('should return 2 for board after one move.', function(done) {
      game.board[4] = 1;
      game.moves.push(4);

      game.nextMark().should.equal(2);
      done();
    });

    it('should return 1 for board after two moves.', function(done) {
      game.board[4] = 1;
      game.moves.push(4);
      game.board[4] = 2;
      game.moves.push(5);

      game.nextMark().should.equal(1);
      done();
    });
  });

  describe('markPlayer', function() {
    beforeEach(function() {
      game.players.push(player1);
      game.players.push(player2);
    });

    describe('when startingOffset is 0', function() {
      beforeEach(function() {
        game.startingOffset = 0;
      });

      it('should return player at index 0 for mark 1.', function(done) {
        game.markPlayer(1).should.equal(player1);
        done();
      });

      it('should return player at index 1 for mark 2.', function(done) {
        game.markPlayer(2).should.equal(player2);
        done();
      });
    });

    describe('when startingOffset is 1', function() {
      beforeEach(function() {
        game.startingOffset = 1;
      });

      it('should return player at index 1 for mark 1.', function(done) {
        game.markPlayer(1).should.equal(player2);
        done();
      });

      it('should return player at index 0 for mark 2.', function(done) {
        game.markPlayer(2).should.equal(player1);
        done();
      });
    });
  });

  describe('when status is "playing"', function() {
    beforeEach(function() {
      game.startingOffset = 0;
    });

    describe('makeMove', function() {
      describe('when called for the next mark player', function() {
        it('should mark board and add move to moves.', function(done) {
          game.markPlayer(1).should.equal(player1);

          game.makeMove(3, player1);

          game.board[3].should.equal(1);
          game.moves.should.eql([3]);
          done();
        });

        it('should delete pingedAt.', function(done) {
          game.pingedAt = new Date();

          game.makeMove(0, player1);

          game.should.not.have.property('pingedAt');
          done();
        });

        it('should no op if index is marked.', function(done) {
          game.makeMove(3, player1);
          game.pingedAt = new Date();

          game.makeMove(3, player2);

          game.board[3].should.equal(1);
          game.moves.should.eql([3]);
          game.should.have.property('pingedAt');
          done();
        });
      });

      describe('when called for the wrong player', function() {
        it('should no op.', function(done) {
          game.makeMove(3, player1);
          game.pingedAt = new Date();

          game.makeMove(1, player1);

          game.board[1].should.equal(0);
          game.moves.should.eql([3]);
          game.should.have.property('pingedAt');
          done();
        });
      });
    });

    describe('checkGameOver', function() {
      it('should return false if not win/lost/tied.', function(done) {
        game.checkGameOver().should.be.false;
        done();
      });

      it('should return true and set result if tied.', function(done) {
        game.board = [1, 2, 1, 1, 2, 1, 2, 1, 2];

        game.checkGameOver().should.be.true;

        game.results.should.be.empty;
        done();
      });

      it('should return true and set result if won/lost.', function(done) {
        game.board = [1, 0, 2, 1, 2, 0, 1, 2, 1];

        game.checkGameOver().should.be.true;

        game.results.won.should.equal(player1);
        game.results.lost.should.equal(player2);
        done();
      });
    });

    describe('resign', function() {
      it('should set status to "game over".', function(done) {
        game.resign(player1).should.be.true;

        game.status.should.equal('game over');
        done();
      });

      it('should delete pingedAt.', function(done) {
        game.pingedAt = new Date();

        game.resign(player1).should.be.true;

        game.status.should.not.have.property('pingedAt');
        done();
      });

      it('should resign for correct player.', function(done) {
        game.resign(player1).should.be.true;

        game.results.won.should.equal(player2);
        game.results.lost.should.equal(player1);
        done();
      });
    });

    describe('ping', function() {
      it('should set pingedAt if not set.', function(done) {
        game.should.not.have.property('pingedAt');

        game.ping().should.be.true;
        game.should.have.property('pingedAt');
        done();
      });

      it('should no op if pingedAt is already set.', function(done) {
        var pingedAt = new Date();
        game.pingedAt = pingedAt;

        (game.ping() === undefined).should.be.true;

        game.pingedAt.should.equal(pingedAt);
        done();
      });
    });

    describe('timedOut', function() {
      it('should resign for mark player.', function(done) {
        game.pingedAt = new Date();
        game.nextMark().should.equal(1);
        game.markPlayer(1).should.equal(player1);

        game.timedOut().should.be.true;

        game.results.won.should.equal(player2);
        game.results.lost.should.equal(player1);
        done();
      });

      it('should no op if pingedAt not set.', function(done) {
        game.nextMark().should.equal(1);
        game.markPlayer(1).should.equal(player1);

        (game.timedOut() === undefined).should.be.true;
        done();
      });
    });
  });

  describe('when status is "game over"', function() {
    beforeEach(function() {
      game.status = 'game over';
    });

    describe('makeMove', function() {
      it('should no op.', function(done) {
        game.makeMove(1, player1);

        game.board[0].should.equal(0);
        game.moves.should.be.empty;
        done();
      });
    });

    describe('checkGameOver', function() {
      it('should no op.', function(done) {
        (game.checkGameOver() === undefined).should.true;
        game.should.not.have.property('results');
        done();
      });
    });

    describe('resign', function() {
      it('should no op.', function(done) {
        (game.resign(player1) === undefined).should.be.true;
        (game.resign(player2) === undefined).should.be.true;
        done();
      });
    });

    describe('ping', function() {
      it('should no op.', function(done) {
        (game.ping() === undefined).should.be.true;
        done();
      });
    });

    describe('timedOut', function() {
      it('should no op.', function(done) {
        (game.timedOut() === undefined).should.be.true;
        done();
      });
    });
  });
});
