'use strict';

var _ = require('lodash');

function Game(id, player1, player2) {
  this.id = id;
  this.board = _.fill(new Array(9), 0);
  this.moves = [];
  this.players = [player1, player2];
  this.startingOffset = (Math.random() * 2) | 0;
  this.status = 'playing';
}

/**
 * Mark to be used when making the next move.
 *
 * @returns {number} mark
 */
Game.prototype.nextMark = function() {
  return (this.moves.length % 2) + 1
};

/**
 * Player for the mark.
 *
 * Calculates the position in the player array for the given mark, taking into
 * account the starting offset for this game.
 *
 * @param mark
 * @returns {*}
 */
Game.prototype.markPlayer = function(mark) {
  return this.players[(mark + 1 + this.startingOffset) % 2];
};

/**
 * Claim position on the board for the mark (turn) player.
 *
 * @param index Position on the board to claim.
 * @param userId Id of user making the request to match against expectation.
 * @returns {boolean} return if any changes were made to the game.
 */
Game.prototype.makeMove = function(index, userId) {
  var mark = this.nextMark();
  if (this.status !== 'playing' ||
      this.board[index] ||
      this.markPlayer(mark) !== userId) {
    return;
  }
  this.board[index] = mark;
  this.moves.push(index);
  delete this.pingedAt;
  return true;
};

// Functions for checking if any three tiles contain the same mark.

function rowWin(board) {
  for (var r = 0; r < 3; r++) {
    var mark = board[3 * r];
    if (mark && board[3 * r + 1] === mark && board[3 * r + 2] === mark) {
      return mark;
    }
  }
}

function colWin(board) {
  for (var c = 0; c < 3; c++) {
    var mark = board[c];
    if (mark && board[c + 3] === mark && board[c + 6] === mark) {
      return mark;
    }
  }
}

function diagWin(board) {
  var mark = board[4];
  if (mark &&
      board[0] === mark && board[8] === mark ||
      board[2] === mark && board[6] === mark) {
    return mark;
  }
}

function winner(board) {
  return rowWin(board) || colWin(board) || diagWin(board);
}

function otherPlayer(players, player) {
  return players[0] === player ? players[1] : players[0];
}

/**
 * Check board for winner or tie.
 *
 * If game is won/lost/tied, a results object is set on the game. Returns
 * if the game is over.
 *
 * TODO: Refactor to take an index and check only possible new wins.
 *
 * @returns {boolean|undefined} undefined is status is 'game over' already.
 */
Game.prototype.checkGameOver = function() {
  if (this.status !== 'playing') return;
  var winningMark = winner(this.board);
  if (winningMark || _.all(this.board)) {
    this.status = 'game over';
    this.results = {};
    if (winningMark) {
      this.results.won = this.markPlayer(winningMark);
      this.results.lost = otherPlayer(this.players, this.results.won);
    }
    return true;
  }
  return false;
};

/**
 * Resign the game for the player.
 *
 * The results are set with lost equal to the resigning player and won set
 * to the other player.
 *
 * @param userId resigning player
 * @returns {boolean|undefined} returns true if game is resigned.
 */
Game.prototype.resign = function(userId) {
  if (this.status !== 'playing') return;
  this.status = 'game over';
  this.results = {};
  this.results.won = otherPlayer(this.players, userId);
  this.results.lost = userId;
  delete this.pingedAt;
  return true;
};

/**
 * Marks this game as pinged by setting a Date.
 *
 * Can be used to set a limit on the amount of time before the next move
 * needs to be made.
 *
 * @returns {boolean} returns if a new ping is registered on the game.
 */
Game.prototype.ping = function() {
  if (this.status !== 'playing' || this.pingedAt) return;
  this.pingedAt = new Date();
  return true;
};


/**
 * The callback that resigns the game if no move made before the ping timeout.
 *
 * This resigns the game for the markPlayer because that player is expected
 * to make the next move.
 *
 * @returns {boolean|undefined} returns true if game is resigned.
 */
Game.prototype.timedOut = function() {
  if (this.status !== 'playing' || !this.pingedAt) return;
  return this.resign(this.markPlayer(this.nextMark()));
};

module.exports = Game;
