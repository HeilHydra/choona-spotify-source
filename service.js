var Waterway = require("waterway");
var SpotifyClient = require("./lib/SpotifyClient");
var config = require("config");
var Throttle = require("throttle");

var service = new Waterway(config.waterway);
var spotifyClient = new SpotifyClient(config.spotify);

service.request("source", "spotify", "search", ":searchString")
  .respond(function (req) {
    return spotifyClient.search(req.params.searchString);
  });

service.request("source", "spotify", "getTrack", ":trackId")
  .respond(function (req) {
    return spotifyClient.get("spotify:track:" + req.params.trackId)
      .then(function (track) {
        normalizeTrack(track, req.params.trackId);
        return track;
      });
  });

service.stream("source", "spotify", "play", ":trackId")
  .writable(function (stream, req) {
    spotifyClient.get("spotify:track:" + req.params.trackId)
      .then(function (track) {
        track
          .play()
          .pipe(new Throttle(20000))
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