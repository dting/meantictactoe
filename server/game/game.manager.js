/**
 * In memory implementation of a simple game queue and player to game
 * lookup table. Keeps a count of games that have not been cleaned up
 * and adds players to queue until gameCount is less than maxConcurrentGames.
 */

'use strict';

var _ = require('lodash');
var uuid = require('node-uuid');
var Game = require('./tictactoe');

var queue = [];
var players = Object.create(null);
var gameCount = 0;
var maxConcurrentGames = 1000;

/**
 * Creates a game with players from queue.
 *
 * Map the created game to the users in the players map.
 *
 * @returns {Game} returns the created game.
 */
function createGame() {
  gameCount++;
  var player1 = queue.pop();
  var player2 = queue.pop();
  var game = new Game(uuid.v4(), player1, player2);
  players[player1] = game;
  players[player2] = game;
  return game;
}

/**
 * Add user to queue and creates game if concurrent games limit is not reached.
 *
 * @param userId
 * @returns {Game|'queued'}
 */
exports.playGame = function(userId) {
  if (userId in players) return;
  queue.unshift(userId);
  if (queue.length === 2 && gameCount < maxConcurrentGames) {
    players[userId] = createGame();
  } else {
    players[userId] = 'queued';
  }
  return players[userId];
};

/**
 * Removes user from queue.
 *
 * @param userId
 * @returns {boolean} returns if user was removed from the queue.
 */
exports.leaveQueue = function(userId) {
  if (players[userId] === 'queued') {
    _.pull(queue, userId);
    delete players[userId];
    return true;
  }
  return false;
};

/**
 * Removes user from players map if still mapped to gameId.
 *
 * TODO: Return error if user isn't mapped to a 'game over' or gameId game?
 *
 * @param userId
 * @param gameId
 * @returns {boolean} returns if userId unmapped to gameId successfully.
 */
exports.leaveGame = function(userId, gameId) {
  var game = players[userId];
  if (game && game.id === gameId && game.status === 'game over') {
    delete players[userId];
    return true;
  }
  return false;
};

/**
 * Creates next game if players available and not at concurrent max.
 *
 * @param callback function to call with the created game.
 */
exports.nextGame = function(callback) {
  if (--gameCount < maxConcurrentGames && queue.length > 1) {
    callback(createGame());
  }
};

/**
 * Gets mapping for userId.
 *
 * @param userId
 * @returns {Game|'queued'|undefined}
 */
exports.get = function(userId) {
  return players[userId];
};

/**
 * Gets game for userId.
 *
 * @param userId
 * @returns {Game|undefined}
 */
exports.getGame = function(userId) {
  var result = players[userId];
  if (result && result !== 'queued') return result;
};

/**
 * Visible for testing.
 * @private
 */
exports._private = {
  queue: queue,
  setMaxConcurrentGames: function(num) {
    maxConcurrentGames = num;
  },
  getGameCount: function() {
    return gameCount;
  },
  setGameCount: function(num) {
    gameCount = num;
  },
  reset: function() {
    queue.length = 0;
    players = Object.create(null);
    gameCount = 0;
  }
};
