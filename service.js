var Waterway = require("waterway");
var SpotifyClient = require("./lib/SpotifyClient");
var config = require("config");
var Throttle = require("throttle");
var util = require("spotify-web/lib/util");
var _ = require("lodash-node");

var service = new Waterway(config.waterway);
var spotifyClient = new SpotifyClient(config.spotify);

service.request("source", "spotify", "search", ":searchString")
  .respond(function (req) {
    return spotifyClient.search(req.params.searchString);
  });

service.request("source", "spotify", "getTrack", ":trackId")
  .respond(function (req) {
    return spotifyClient
      .get("spotify:track:" + req.params.trackId)
      .then(normalizeTrack);
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


function normalizeTrack(track) {
  var output = {
    id: util.gid2id(track.gid),
    title: track.name,
    length: parseInt(track.duration, 10),
    artist: track.artist.name,
    cover: {
      large: _.findWhere(track.album.cover, { size: "LARGE" }).uri,
      normal: _.findWhere(track.album.cover, { size: "DEFAULT" }).uri,
      small: _.findWhere(track.album.cover, { size: "SMALL" }).uri,
    }
  };

  return output;
}