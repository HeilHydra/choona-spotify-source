var Spotify = require("spotify-web");
var lift = require("when/node").lift;
var parseXml = lift(require("xml2js").parseString);

function SpotifyClient(config) {
  this.config = config || {};
}

SpotifyClient.prototype.search = function (searchString) {
  return this._getSpotify()
    .then(function (spotify) {
      var search = lift(spotify.search.bind(spotify));
      return search({
        query: searchString,
        type: [1, 4]
      });
    })
    .then(parseXml)
    .then(function (data) {
      return data.result;
    });
};

SpotifyClient.prototype.get = function (uri) {
  return this._getSpotify()
    .then(function (spotify) {
      var get = lift(spotify.get.bind(spotify));
      return get(uri);
    });
};

SpotifyClient.prototype._getSpotify = function () {
  var login = lift(Spotify.login);
  return login(this.config.username, this.config.password);
};

module.exports = SpotifyClient;