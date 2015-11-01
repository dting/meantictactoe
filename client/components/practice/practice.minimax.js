'use strict';

var app = angular.module('ticTacToeApp');

app.factory('Minimax', function() {
  var PLAYER = 1;
  var COMPUTER = 2;

  function getMove(board) {
    var best = -Infinity;
    var moves = board.moves();
    var bestMove = moves[0];
    if (moves.length < 8) {
      _.forEach(moves, function(move) {
        var score = miniMove(board.copy().mark(COMPUTER, move), 0);
        if (score > best) {
          best = score;
          bestMove = move;
        }
      });
    } else if (_.contains(moves, 4)) {
      bestMove = 4;
    }
    return bestMove;
  }

  function miniMove(board, depth) {
    var winner = board.winner();
    var moves = board.moves();
    var best = Infinity;

    if (winner === COMPUTER) return 20 - depth;
    if (winner === PLAYER) return depth - 20;
    if (!moves.length) return 0;
    return _.reduce(moves, function(b, m) {
      return Math.min(maxiMove(board.copy().mark(PLAYER, m), depth + 1), b);
    }, best);
  }

  function maxiMove(board, depth) {
    var winner = board.winner();
    var moves = board.moves();
    var best = -Infinity;

    if (winner === COMPUTER) return 20 - depth;
    if (winner === PLAYER) return depth - 20;
    if (!moves.length) return 0;
    return _.reduce(moves, function(b, m) {
      return Math.max(miniMove(board.copy().mark(COMPUTER, m), depth + 1), b);
    }, best);
  }

  return {
    getMove: getMove
  };
});
