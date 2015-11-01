'use strict';

var app = angular.module('ticTacToeApp');

var GameCtrl = function($scope, $mdToast, socketAuth, socket, Auth) {
  var userId = Auth.getCurrentUser()._id;
  var messages = ['YOU TIED!', 'YOU WON!', 'YOU LOST!'];

  $scope.board = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  function toastResults(result) {
    var toast = $mdToast.simple().position('top right').hideDelay(2000);
    if (!result.won) {
      toast.content(messages[0]);
    } else {
      toast.content(result.won === userId ? messages[1] : messages[2]);
    }
    $mdToast.show(toast);
  }

  socketAuth.getAuthenticatedAsPromise().then(function() {
    var sock = socket.socket;

    $scope.play = function() {
      if ($scope.game) return;
      sock.emit('play');
    };

    $scope.clickTile = function(index) {
      if ($scope.game.board[index]) return;
      sock.emit('submit move', {index: index, gameId: $scope.game.id});
    };

    $scope.leaveQueue = function() {
      if ($scope.status !== 'waiting') return;
      sock.emit('leave queue');
    };

    $scope.resign = function() {
      if ($scope.game.status !== 'playing') return;
      sock.emit('resign', $scope.game.id);
    };

    $scope.leaveGame = function() {
      if ($scope.game.status !== 'game over') return;
      sock.emit('leave game', $scope.game.id);
    };

    $scope.ping = function() {
      if ($scope.game.pingedAt) return;
      sock.emit('ping');
    };

    sock.forward('queued', $scope);
    $scope.$on('socket:queued', function() {
      $scope.status = 'waiting';
    });

    sock.forward('left queue', $scope);
    $scope.$on('socket:left queue', function() {
      delete $scope.status;
    });

    sock.forward('updated', $scope);
    $scope.$on('socket:updated', function(ev, game) {
      delete $scope.status;
      $scope.game = game;
      if (!$scope.game.results) return;
      toastResults($scope.game.results);
    });

    sock.forward('left game', $scope);
    $scope.$on('socket:left game', function(ev, leavingId) {
      if (leavingId !== userId) return;
      delete $scope.game;
    });

    sock.forward('cleanup', $scope);
    $scope.$on('socket:cleanup', function(ev, gameId) {
      if ($scope.game.id !== gameId) return;
      delete $scope.game;
    });

    sock.emit('sync');
  });

  $scope.myMark = function() {
    return $scope.game.players[$scope.game.startingOffset] === userId ? 1 : 2;
  };

  $scope.oppMark = function() {
    return $scope.game.players[$scope.game.startingOffset] !== userId ? 1 : 2;
  };
};

app.controller('GameCtrl', GameCtrl);

