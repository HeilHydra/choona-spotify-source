var Waterway = require("waterway");
var SpotifyClient = require("./lib/SpotifyClient");
var config = require("config");
var Throttle = require("throttle");

var app = new Waterway(config.waterway);
var spotifyClient = new SpotifyClient(config.spotify);

app.request("source", "spotify", "search", ":searchString")
  .respond(function (req) {
    return spotifyClient.search(req.params.searchString);
  });

app.request("source", "spotify", "getTrack", ":trackId")
  .respond(function (req) {
    return spotifyClient.get("spotify:track:" + req.params.trackId)
      .then(function (track) {
        normalizeTrack(track, req.params.trackId);
        return track;
      });
  });

app.stream("source", "spotify", "play", ":trackId")
  .writable(function (stream, req) {
    spotifyClient.get("spotify:track:" + req.params.trackId)
      .then(function (track) {
        track
          .playPreview()
          .pipe(new Throttle(12000))
          .pipe(stream);
      });
  });


function normalizeTrack(track, id) {
  delete track.file;
  delete track.preview;
  delete track.alternative;
  delete track._loaded;
  track.id = id;
  Object.defineProperty(track, "previewUrl", function () {
    return "";
  });
}