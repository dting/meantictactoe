'use strict';

var app = angular.module('ticTacToeApp');

app.controller('LoginCtrl', function($scope, Auth, $window, $state) {
  $scope.user = {};
  $scope.errors = {};

  $scope.state = $state;
  $scope.login = function(form) {
    $scope.submitted = true;

    if (form.$valid) {
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function() {
        // Hack to get the socket to re-authenticate after login out and in.
        $window.location.href = '/';
      }).catch(function(err) {
        $scope.errors.other = err.message;
      });
    }
  };
});
