'use strict';

var app = angular.module('ticTacToeApp');

app.controller('SignupCtrl', function($scope, Auth, $window, $state) {
  $scope.user = {};
  $scope.errors = {};

  $scope.state = $state;
  $scope.register = function(form) {
    $scope.submitted = true;

    if (form.$valid) {
      Auth.createUser({
        name: $scope.user.name,
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function() {
        // Hack to get the socket to authenticate after signup.
        $window.location.href = '/';
      }).catch(function(err) {
        err = err.data;
        $scope.errors = {};

        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, function(error, field) {
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.message;
        });
      });
    }
  };
});
