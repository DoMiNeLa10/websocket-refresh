#!/bin/node
/*eslint-env node */

// configurable constants
const port = 8888;

const webSocketServer = require("websocket").server,
      http = require("http"),
      timers = require("timers");

let clients = {};

let httpServer = http.createServer((request, response) => {
  console.log(`${new Date()}: recieved request`);
  response.writeHead(404);
  response.end();
});

httpServer.listen(
  port,
  () => console.log(`${new Date()}: listening on port ${port}`));

// FIXME: autoAcceptConnections shouldn't be set to true in production
let wsServer = new webSocketServer({httpServer, autoAcceptConnections: true});

wsServer.on("connect", (request) => {
  const extractIP = (str) => {
    const split = str.split(":");
    return split[split.length - 1];
  };
  
  const uniqueKey =
        `${extractIP(request.remoteAddress)}@${(new Date()).valueOf()}`;

  console.log(`${new Date()}: ${uniqueKey} connected`);
  clients[uniqueKey] = request;

  request.on("close", () => {
    console.log(`${new Date()}: ${uniqueKey} disconnected`);
    delete clients[uniqueKey];
  });
});

process.stdin.on(
  "data", () => {
    const connections = Object.values(clients);
    console.log(`Sending a refresh command to ${connections.length} clients…`);
    connections.forEach((connection) => connection.sendUTF("refresh"));
  });
