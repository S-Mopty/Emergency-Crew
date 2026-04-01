// =============================================================================
//  index.js - Emergency Crew server entry point
//  Express (static files) + Colyseus (WebSocket game server)
// =============================================================================

const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { GameRoom } = require("./GameRoom");

const app = express();

// Serve the client static files
app.use(express.static(path.join(__dirname, "../../client")));

// Serve game assets
app.use("/assets", express.static(path.join(__dirname, "../../assets")));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

// Define the game room
gameServer.define("game", GameRoom)
  .filterBy(["roomId"]); // allow filtering by custom roomId if needed

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`[Emergency Crew] Server running -> http://localhost:${PORT}`);
});
