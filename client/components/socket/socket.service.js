/* global io */
'use strict';

var app = angular.module('ticTacToeApp');

// http://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO/
app.factory('socket', function(socketFactory, Auth) {
  var socket, isAuthenticated,
    self = {
      getAuthenticated: function() {
        return isAuthenticated;
      }
    };
  // By default the socket property is null and is not authenticated
  self.socket = socket;
  // Initializer function to connect the socket for the first time after
  // logging in to the app
  self.initialize = function() {
    console.log('initializing socket');

    isAuthenticated = false;

    var ioSocket = io('', {
      path: '/socket.io-client'
    });
    // Call btford angular-socket-io library factory to connect to server at
    // this point
    self.socket = socket = socketFactory({ioSocket: ioSocket});

    // These listeners will only be applied once when socket.initialize is
    // called they will be triggered each time the socket connects/re-connects
    // (e.g. when logging out and logging in again)
    socket.on('authenticated', function() {
      isAuthenticated = true;
      console.log('socket is jwt authenticated');
    });

    socket.on('connect', function() {
      //send the jwt
      socket.emit('authenticate', {token: Auth.getToken()});
    });
  };

  return self;
});

app.factory('socketAuth', function(socket, $q, $rootScope) {
  $rootScope.$on('logout', function() {
    if (socket.socket) {
      socket.socket.disconnect();
    }
    socket.socket = null;
  });

  return {
    getAuthenticatedAsPromise: function() {
      var listenForAuthentication = function() {
        console.log('listening for socket authentication');
        var listenDeferred = $q.defer();
        var authCallback = function() {
          console.log('listening for socket authentication - done');
          listenDeferred.resolve(true);
        };
        socket.socket.on('authenticated', authCallback);
        return listenDeferred.promise;
      };

      if (!socket.socket) {
        socket.initialize();
        return listenForAuthentication();
      } else {
        if (socket.getAuthenticated()) {
          return $q.when(true);
        } else {
          return listenForAuthentication();
        }
      }
    }
  };
});
