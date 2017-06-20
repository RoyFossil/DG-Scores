angular.module('app').
factory('dataService', function ($http) {
    var urlBase = "http://127.0.0.1:50000";
	
    function _getPlayers() {
        return $.ajax({
            url: urlBase + "/getPlayers"
        })
    }

    function _getCourses() {
        return $.ajax({
            url: urlBase + "/getCourses"
        })
    }

    function _getPlayer(id) {
        return $.ajax({
            url: urlBase + "/getPlayer/" + id
        })
    }

    function _getCourse(id) {
        return $.ajax({
            url: urlBase + "/getCourse/" + id
        })
    }

    function _getNumGamesPlayed(uuid) {
        return $.ajax({
            url: urlBase + "/getNumGamesPlayed/" + uuid
        })
    }

    function _getNumGamesWon(uuid) {
        return $.ajax({
            url: urlBase + "/getNumGamesWon/" + uuid
        })
    }

    function _getGame(uuid) {
        return $.ajax({
            url: urlBase + "/getGame/" + uuid
        })
    }

    function _getMostRecentGameUuid(playerUuid) {
        return $.ajax({
            url: urlBase + "/getMostRecentGameUuid/" + playerUuid
        })
    }

    return {
        getPlayers: _getPlayers,
        getCourses: _getCourses,
        getPlayer: _getPlayer,
        getCourse: _getCourse,
        getNumGamesPlayed: _getNumGamesPlayed,
        getNumGamesWon: _getNumGamesWon,
        getGame: _getGame,
        getMostRecentGameUuid: _getMostRecentGameUuid
    }
});