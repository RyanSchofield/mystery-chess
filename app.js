
const CorsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
const Cors = require("cors")(CorsOptions);
// const Express = require("express")().use(Cors);
// const Http = require("http").Server(Express);
// const Socketio = require("socket.io")(Http, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"]
//     }
//   });

const express = require("express");
const SocketIO = require("socket.io");

// const path = require('path');
// const app = Express;

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const server = express()
//   .static(path.resolve(__dirname, 'frontend', 'static'),
//     {extensions: ["js"]})
  .use(Cors)
  .use((req, res) => res.sendFile(INDEX, { root:`${ __dirname}/dist/docs` }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`, __dirname));

const Socketio = SocketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

// app.use(Express.static(__dirname + '/dist/docs'));
// app.get('/*', function(req,res) {
//     res.sendFile(path.join(__dirname+'/dist/docs/index.html'));
// });

// app.listen(process.env.PORT || 8080);

// Http.listen(3000, () => {
//     console.log("listening on 3000");
// });

// Http.listen(process.env.PORT || 8080, () => {
//     console.log("listening");
// });

var player1;
var player2;
var spectators = [];
var numSpectators = 0;

var mostRecentData;
var messages = [];


Socketio.on("connection", socket => {
    // console.log('connection');
    let socketStatus;

    socket.emit("messages", {
        messages: messages
    });

    if (!player1) {
        player1 = socket;
        socketStatus = 'player1';
        console.log('player 1 connected');

        socket.emit("setPlayerStatus", {
            color: 1,
            isSpectator: false,
            spectatorNumber: -1,
        });
        socket.emit("moveUpdate", mostRecentData);
    } else if (!player2) {
        socketStatus = 'player2';
        console.log('player 2 connected');        

        player2 = socket;
        socket.emit("setPlayerStatus", {
            color: 0,
            isSpectator: false,
            spectatorNumber: -1,
        });
        socket.emit("moveUpdate", mostRecentData);
    } else {
        spectators.push(socket);
        socketStatus = 'spectator';
        numSpectators++;
        console.log('spectator connected');

        socket.emit("setPlayerStatus", {
            color: Math.floor(Math.random()),
            isSpectator: true,
            spectatorNumber: numSpectators,
        });
        socket.emit("moveUpdate", mostRecentData);
    }

    socket.on("move", data => {
        console.log('move by', socketStatus);
        mostRecentData = data;
        Socketio.emit("moveUpdate", data);
    });

    socket.on("message", data => {
        console.log("message", data);
        messages.push(data);
        Socketio.emit("messages", {
            messages: messages
        });
    });

    socket.on("refresh", data => {
        Socketio.emit("refresh", {});
    });

    socket.on("disconnect", _ => {
        // console.log(socket);
        if (socket == player1 || socketStatus == 'player1') {
            console.log('player 1 disconnected');
            player1 = null;
        } else if (socket == player2 || socketStatus == 'player2') {
            console.log('player 2 disconnected');
            player2 = null;
        } else {
            console.log('spectator disconnected');
            numSpectators--;
        }

        if (player1 === null && player2 === null) {
            mostRecentData = null;
        }
    });
});

/**
 * Implement move histroy, with functionality for storing the history of move objects,
 * which contain properties for the gameboard state.
 * Listen for undo socket events, pop from moveHistory, and send that move as a moveUpdate to the client.
 */

/**
 *  Changes to package.json:
 *  
 */
 