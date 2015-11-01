'use strict';

var should = require('should');
var GameManager = require('./game.manager');

describe('GameManager', function() {
  var userId1 = 'userId1';
  var userId2 = 'userId2';
  var userId3 = 'userId3';
  var userId4 = 'userId4';

  beforeEach(function() {
    GameManager._private.reset();
  });

  it('should not start with entries for any players.', function(done) {
    (GameManager.getGame(userId1) === undefined).should.be.true;
    (GameManager.getGame(userId2) === undefined).should.be.true;
    (GameManager.getGame(userId3) === undefined).should.be.true;
    (GameManager.getGame(userId4) === undefined).should.be.true;
    GameManager._private.queue.should.be.empty;
    done();
  });

  describe('playGame', function() {
    it('should no op if player is already mapped', function() {
      GameManager.playGame(userId1);

      (GameManager.playGame(userId1) === undefined).should.be.true;
    });

    describe('when under concurrency max', function() {
      it('should add player to queue if queue is empty.', function(done) {
        GameManager.playGame(userId1).should.equal('queued');
        done()
      });

      it('should map player to "queued".', function(done) {
        GameManager.playGame(userId1);

        GameManager.get(userId1).should.equal('queued');
        done()
      });

      it('should create a game if one person is in the queue.', function(done) {
        GameManager.playGame(userId1).should.equal('queued');

        var result = GameManager.playGame(userId2);

        result.status.should.equal('playing');
        done();
      });

      it('should map players to created game.', function(done) {
        GameManager.playGame(userId1).should.equal('queued');

        var result = GameManager.playGame(userId2);

        GameManager.getGame(userId1).should.eql(result);
        GameManager.getGame(userId2).should.eql(result);
        done();
      });
    });

    describe('when at/over concurrency max', function() {
      beforeEach(function() {
        GameManager._private.setMaxConcurrentGames(1);
        GameManager.playGame(userId1);
        GameManager.playGame(userId2);
      });

      it('should add player to queue if empty.', function(done) {
        GameManager.playGame(userId3).should.equal('queued');
        done()
      });

      it('should add player to queue if not empty.', function(done) {
        GameManager.playGame(userId3).should.equal('queued');
        GameManager.playGame(userId4).should.equal('queued');
        done()
      });
    });
  });

  describe('leaveQueue', function() {
    it('should be false if userId is not mapped to "queued".', function(done) {
      GameManager.leaveQueue(userId1).should.be.false;
      done();
    });

    describe('when user is queued', function() {
      beforeEach(function() {
        GameManager.playGame(userId1).should.equal('queued');
      });

      it('should remove userId from queue.', function(done) {
        GameManager.leaveQueue(userId1).should.be.true;
        done();
      });

      it('should remove userId from players map.', function(done) {
        GameManager.leaveQueue(userId1);

        (GameManager.get(userId1) === undefined).should.be.true;
        done();
      });
    });
  });

  describe('leaveGame', function() {
    it('should be false if userId is not mapped.', function(done) {
      GameManager.leaveGame(userId1, 'something').should.be.false;
      done();
    });

    it('should be false if userId is not mapped to a game.', function(done) {
      GameManager.playGame(userId1);
      GameManager.get(userId1).should.equal('queued');

      GameManager.leaveGame(userId1, 'something').should.be.false;
      done();
    });

    describe('when game status for user is "game over"', function() {
      var game;

      beforeEach(function() {
        GameManager.playGame(userId1);
        game = GameManager.playGame(userId2);
        game.status = 'game over';
      });

      it('should be false if gameId does not match.', function(done) {
        GameManager.leaveGame(userId1, 'something').should.be.false;
        done();
      });

      it('should be true if gameId does matches.', function(done) {
        GameManager.leaveGame(userId1, game.id).should.be.true;
        done();
      });

      it('should remove user from players map.', function(done) {
        GameManager.leaveGame(userId1, game.id);

        (GameManager.get(userId1) === undefined).should.be.true;
        done();
      });
    });
  });
});
