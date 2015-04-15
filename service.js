var Waterway = require("waterway");
var SpotifyClient = require("./lib/SpotifyClient");
var config = require("config");
var lame = require("lame");
var Speaker = require("speaker");
var NRP = require("node-redis-pubsub");

var app = new Waterway(config.waterway);
var spotifyClient = new SpotifyClient(config.spotify);

app.request("source", "spotify", "search")
  .respond(function (data) {
    return spotifyClient.search(data.search);
  });

app.stream("source", "spotify", "play")
  .writable(function (stream, data, key) {
    spotifyClient.get("spotify:track:" + data.id)
      .then(function (track) {
        track.play().pipe(stream);
      });
  });