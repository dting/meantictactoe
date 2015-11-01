'use strict';

var app = angular.module('ticTacToeApp');

app.directive('navbar', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'components/navbar/navbar.html',
    controller: 'NavbarCtrl'
  };
});
