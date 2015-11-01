'use strict';

var app = angular.module('ticTacToeApp');

var PracticeCtrl = function($scope, $timeout, Board, Minimax, $mdToast) {
  var messages = ['YOU TIED!', 'YOU WON!', 'YOU LOST!'];
  var board = $scope.board = new Board();

  $scope.marks = {me: 1, opp: 2};

  $scope.clickTile = function(idx) {
    if (board.tiles[idx] || $scope.thinking || $scope.gameOver) { return; }

    $scope.thinking = true;
    board.mark($scope.marks.me, idx);
    // Since the computer can't be beaten, no need to check winner.
    if (!board.full()) {
      board.mark($scope.marks.opp, Minimax.getMove(board));
    }
    $scope.gameOver = board.winner() || board.full();
    $scope.thinking = false;
  };

  $scope.toggle = function() {
    if (!_.any(board.tiles)) {
      $scope.marks.opp = $scope.marks.me;
      $scope.marks.me = $scope.marks.me % 2 + 1;
    }
  };

  $scope.$watch('gameOver', function(newVal, oldVal) {
    if (newVal !== oldVal && newVal) {
      var toast = $mdToast.simple().position('top right').hideDelay(2000);
      $mdToast.show(toast.content(messages[board.winner() || 0]));
      $timeout(function() {
        board = $scope.board = new Board();
        $scope.gameOver = false;
      }, 2000);
    }
  });
};

app.controller('PracticeCtrl', PracticeCtrl);

