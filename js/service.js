﻿angular.module('app').
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

    function _getAllGameUuidsForPlayer(id) {
        return $.ajax({
            url: urlBase + "/getAllGameUuidsForPlayer/" + id
        })
    }

    function _getAllGamesForPlayer(id) {
        return $.ajax({
            url: urlBase + "/getAllGamesForPlayer/" + id
        })
    }

    function _getBestGamesForPlayer(id) {
        return $.ajax({
            url: urlBase + "/getBestGamesForPlayer/" + id
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

    function _getCourseWithHoles(id) {
        return $.ajax({
            url: urlBase + "/getCourseWithHoles/" + id
        })
    }

    function _getGameUuidsForCourse(uuid) {
        return $.ajax({
            url: urlBase + "/getGameUuidsForCourse/" + uuid
        })
    }

    function _getGameInfoFromUuids(uuids) {
        return $.ajax({
            url: urlBase + "/getGameInfoFromUuids/" + JSON.stringify(uuids)
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

    function _addNewPlayers(players) {
        return $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(players),
            url: urlBase + "/addNewPlayers"
        })
    }

    function _addNewGames(gameData) {
        return $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(gameData),
            url: urlBase + "/addNewGames"
        })
    }

    return {
        getPlayers: _getPlayers,
        getCourses: _getCourses,
        getGames: _getGames,
        getAllGameUuidsForPlayer: _getAllGameUuidsForPlayer,
        getAllGamesForPlayer: _getAllGamesForPlayer,
        getBestGamesForPlayer: _getBestGamesForPlayer,
        getPlayer: _getPlayer,
        getCourse: _getCourse,
        getCourseWithHoles: _getCourseWithHoles,
        getGameUuidsForCourse: _getGameUuidsForCourse,
        getGameInfoFromUuids: _getGameInfoFromUuids,
        getNumGamesPlayed: _getNumGamesPlayed,
        getNumGamesWon: _getNumGamesWon,
        getGame: _getGame,
        getMostRecentGameUuid: _getMostRecentGameUuid,
        getCourseCount: _getCourseCount,
        addNewCourses: _addNewCourses,
        addNewHoles: _addNewHoles,
        addNewPlayers: _addNewPlayers,
        addNewGames: _addNewGames
    }
});