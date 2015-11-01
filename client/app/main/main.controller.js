'use strict';

angular.module('ticTacToeApp').controller('MainCtrl', function($scope, Auth) {
  $scope.isLoggedIn = Auth.isLoggedIn;
});
