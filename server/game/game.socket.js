'use strict';

var _ = require('lodash');
var GameManager = require('./game.manager');

exports.register = function(socket, io) {

  socket.on('sync', function() {
    var result = GameManager.get(socket.decoded_token._id);
    if (result) {
      if (result === 'queued') {
        socket.emit('queued');
      } else {
        socket.join(result.id);
        socket.emit('updated', result);
      }
    }
  });

  function subscribeAndEmitGame(game) {
    game.players.forEach(function(playerId) {
      _.forOwn(io.sockets.adapter.rooms[playerId], function(conn, clientId) {
        io.sockets.connected[clientId].join(game.id);
      });
      io.sockets.in(playerId).emit('updated', game);
    });
  }

  socket.on('play', function() {
    var userId = socket.decoded_token._id;
    var result = GameManager.playGame(userId);
    if (result === 'queued') {
      io.sockets.in(userId).emit('queued');
    } else {
      subscribeAndEmitGame(result);
    }
  });

  socket.on('leave queue', function() {
    var userId = socket.decoded_token._id;
    if (GameManager.leaveQueue(userId)) {
      io.sockets.in(userId).emit('left queue');
    }
  });

  function cleanup(game) {
    return function() {
      var gameId = game.id;
      _.forOwn(io.sockets.adapter.rooms[gameId], function(conn, clientId) {
        var clientSocket = io.sockets.connected[clientId];
        clientSocket.emit('cleanup', gameId);
        clientSocket.leave(gameId);
      });
      game.players.forEach(function(userId) {
        GameManager.leaveGame(userId, gameId);
      });
      GameManager.nextGame(subscribeAndEmitGame);
    }
  }

  socket.on('submit move', function(data) {
    var userId = socket.decoded_token._id;
    var game = GameManager.getGame(userId);
    if (game && game.id === data.gameId && game.makeMove(data.index, userId)) {
      if (game.checkGameOver()) {
        setTimeout(cleanup(game), 15 * 1000);
      }
      io.sockets.in(game.id).emit('updated', game);
    }
  });

  function pingResolverFactory(game) {
    var pingedAt = game.pingedAt;
    return function() {
      if (game.pingedAt === pingedAt && game.timedOut()) {
        setTimeout(cleanup(game), 10 * 1000);
        io.sockets.in(game.id).emit('updated', game);
      }
    }
  }

  socket.on('ping', function() {
    var game = GameManager.getGame(socket.decoded_token._id);
    if (game && game.ping()) {
      setTimeout(pingResolverFactory(game), 10 * 1000);
      io.sockets.in(game.id).emit('updated', game);
    }
  });

  socket.on('resign', function(gameId) {
    var game = GameManager.getGame(socket.decoded_token._id);
    if (game && game.id === gameId && game.resign(socket.decoded_token._id)) {
      io.sockets.in(game.id).emit('updated', game);
      setTimeout(cleanup(game), 15 * 1000);
    }
  });

  socket.on('leave game', function(gameId) {
    var userId = socket.decoded_token._id;
    if (GameManager.leaveGame(userId, gameId)) {
      io.sockets.in(gameId).emit('left game', userId);
      _.forOwn(io.sockets.adapter.rooms[userId], function(conn, clientId) {
        io.sockets.connected[clientId].leave(gameId);
      });
    }
  });

  // TODO: Hook this up on the client.
  socket.on('chat', function(msg) {
    var userId = socket.decoded_token._id;
    var game = GameManager.getGame(userId);
    if (game) {
      io.sockets.in(game.id).emit('chat msg', {sender: userId, msg: msg});
    }
  });
};
