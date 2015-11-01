'use strict';

var app = angular.module('ticTacToeApp');

app.controller('NavbarCtrl', function($scope, $state, Auth) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;
  $scope.getCurrentUser = Auth.getCurrentUser;

  $scope.logout = function() {
    Auth.logout();
    $scope.login();
  };

  $scope.login = function() {
    $state.go('login');
  };
});
