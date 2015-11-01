'use strict';

var app = angular.module('ticTacToeApp');

app.factory('Board', function() {
  var WINS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // h
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // v
    [0, 4, 8], [2, 4, 6] // d
  ];

  function Board(tiles) {
    this.tiles = tiles ? tiles : [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  Board.prototype.copy = function() {
    return new Board(this.tiles.slice());
  };

  Board.prototype.mark = function(mark, index) {
    this.tiles[index] = mark;
    return this;
  };

  Board.prototype.moves = function() {
    var m = [];
    this.tiles.forEach(function(tile, move) {
      if (!tile) { m.push(move); }
    });
    return m;
  };

  Board.prototype.winner = function() {
    for (var i = 0; i < WINS.length; i++) {
      var w = WINS[i];
      if (this.tiles[w[0]] &&
          this.tiles[w[0]] === this.tiles[w[1]] &&
          this.tiles[w[1]] === this.tiles[w[2]]) {
        return this.tiles[w[0]];
      }
    }
    return '';
  };

  Board.prototype.full = function() {
    return _.every(this.tiles, _.identity);
  };

  return Board;
});
