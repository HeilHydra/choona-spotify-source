var Spotify = require("spotify-web");
var lift = require("when/node").lift;
var parseXml = lift(require("xml2js").parseString);
var _ = require("lodash-node");

var sourceUrl = 'https://d3rt1990lpmkn.cloudfront.net';
var sourceUrls = {
  tiny: sourceUrl + '/60/',
  small: sourceUrl + '/120/',
  normal: sourceUrl + '/300/',
  large: sourceUrl + '/640/',
  avatar: sourceUrl + '/artist_image/'
};

function SpotifyClient(config) {
  this.config = config || {};
}

SpotifyClient.prototype.search = function (searchString) {
  return this._getSpotify()
    .then(function (spotify) {
      var search = lift(spotify.search.bind(spotify));
      return search({
        query: searchString,
        type: ["tracks", "artists"]
      });
    })
    .then(parseXml)
    .then(normalizeSearchResults);
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

function normalizeSearchResults(results) {
  return _.map(results.tracks[0], function (track) {
    return {
      id: track.id[0],
      artist: track.artist[0],
      cover: {
        large: sourceUrls.large + track["cover-large"][0],
        normal: sourceUrls.normal + track["cover"][0],
        small: sourceUrls.small + track["cover-small"][0]
      },
      length: parseInt(track.length[0], 10),
      title: track.title[0]
    };
  });
}

module.exports = SpotifyClient;