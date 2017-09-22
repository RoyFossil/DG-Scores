angular.module('app.services').
factory('freshData', function ($http) {


    function _courseData() {
        return $.ajax({
            url: 'https://rayfissel.visualstudio.com/DefaultCollection/_apis/tfvc/items/$/DiscGraphs/data/courses.json?api-version=2.0',
            headers: { Authorization: 'Basic cmF5bW9uZF9maXNzZWxAY29tcGFpZC5jb206YmZ4c2pxM2k0a2RydXB6Y3pqaTJ4eHN4dG4zdGZ6cmg1eWhubDdrNHhud29maWhyemVhYQ==' }
        });
    }

    function _playerData() {
        return $.ajax({
            url: 'https://rayfissel.visualstudio.com/DefaultCollection/_apis/tfvc/items/$/DiscGraphs/data/players.json?api-version=2.0',
            headers: { Authorization: 'Basic cmF5bW9uZF9maXNzZWxAY29tcGFpZC5jb206YmZ4c2pxM2k0a2RydXB6Y3pqaTJ4eHN4dG4zdGZ6cmg1eWhubDdrNHhud29maWhyemVhYQ==' }
        });
    }

    function _gameData() {
        return $.ajax({
            url: 'https://rayfissel.visualstudio.com/DefaultCollection/_apis/tfvc/items/$/DiscGraphs/data/games.json?api-version=2.0',
            headers: { Authorization: 'Basic cmF5bW9uZF9maXNzZWxAY29tcGFpZC5jb206YmZ4c2pxM2k0a2RydXB6Y3pqaTJ4eHN4dG4zdGZ6cmg1eWhubDdrNHhud29maWhyemVhYQ==' }
        });
    }


    return {
        courseData: _courseData,
        playerData: _playerData,
        gameData: _gameData
    }
});