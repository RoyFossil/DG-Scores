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

    function _getGames() {
        return $.ajax({
            url: urlBase + "/getGames"
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

    function _getCourseCount(playerUuid) {
        return $.ajax({
            url: urlBase + "/getCourseCount/" + playerUuid
        })
    }

    function _addNewCourses(courses) {
        return $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(courses),
            url: urlBase + "/addNewCourses"
        })
    }

    function _addNewHoles(holes) {
        return $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(holes),
            url: urlBase + "/addNewHoles"
        })
    }

    return {
        getPlayers: _getPlayers,
        getCourses: _getCourses,
        getGames: _getGames,
        getPlayer: _getPlayer,
        getCourse: _getCourse,
        getNumGamesPlayed: _getNumGamesPlayed,
        getNumGamesWon: _getNumGamesWon,
        getGame: _getGame,
        getMostRecentGameUuid: _getMostRecentGameUuid,
        getCourseCount: _getCourseCount,
        addNewCourses: _addNewCourses,
        addNewHoles: _addNewHoles
    }
});