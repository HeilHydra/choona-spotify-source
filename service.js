var Waterway = require("waterway");
var SpotifyClient = require("./lib/SpotifyClient");
var config = require("config");
var lame = require("lame");
var Speaker = require("speaker");
var Throttle = require("throttle");

var app = new Waterway(config.waterway);
var spotifyClient = new SpotifyClient(config.spotify);

app.request("source", "spotify", "search", ":searchString")
  .respond(function (req) {
    return spotifyClient.search(req.params.searchString);
  });

app.stream("source", "spotify", "play", ":trackId")
  .writable(function (stream, req) {
    spotifyClient.get("spotify:track:" + req.params.trackId)
      .then(function (track) {
        track
          .play()
          .pipe(new Throttle(20000))
          .pipe(stream);
      });
  });