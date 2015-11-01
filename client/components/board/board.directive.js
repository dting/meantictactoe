'use strict';

var app = angular.module('ticTacToeApp');

app.directive('board', function() {
  return {
    restrict: 'E',
    scope: {
      board: '=',
      tileClick: '=',
      status: '='
    },
    templateUrl: 'components/board/board.html'
  };
});
