/**
 * Socket.io configuration
 */

'use strict';

var jwt = require('jsonwebtoken');
var config = require('./environment');

// When the user disconnects.. perform this
function onDisconnect(socket) {
  // Leave the user's room.
  socket.leave(socket.decoded_token._id);
}

// When the user connects. perform this
function onConnect(socket, socketio) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function(data) {
    console.info('[%s] %s', socket.handshake.address,
      JSON.stringify(data, null, 2));
  });

  require('../game/game.socket.js').register(socket, socketio);
  // Creates/joins room so we can send messages to all clients for user.
  socket.join(socket.decoded_token._id);
}

// http://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO/
module.exports = function(socketio) {

  socketio.on('connection', function(socket) {
    //temp delete socket from namespace connected map
    delete socketio.sockets.connected[socket.id];

    var options = {
      secret: config.secrets.session,
      timeout: 5000 // 5 seconds to send the authentication message
    };

    var auth_timeout = setTimeout(function() {
      socket.disconnect('unauthorized');
    }, options.timeout || 1000);

    var authenticate = function(data) {
      clearTimeout(auth_timeout);
      jwt.verify(data.token, options.secret, options, function(err, decoded) {
        if (err) {
          socket.disconnect('unauthorized');
        }
        if (!err && decoded) {
          //restore temporarily disabled connection
          socketio.sockets.connected[socket.id] = socket;

          socket.decoded_token = decoded;
          socket.connectedAt = new Date();

          // Disconnect listener
          socket.on('disconnect', function() {
            onDisconnect(socket);
            console.info('SOCKET [%s] DISCONNECTED', socket.id);
          });

          // Call onConnect.
          onConnect(socket, socketio);
          console.info('SOCKET [%s] CONNECTED', socket.id);
          socket.emit('authenticated');
        }
      })
    };

    socket.on('authenticate', authenticate);
  });
};
