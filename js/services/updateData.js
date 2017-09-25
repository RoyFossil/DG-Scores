angular.module('app.services').factory('updateData', function (freshData, dataService) {

    var courseData, playerData, gameData;

    function initData() {

        freshData.courseData().then(function (res) {
            courseData = JSON.parse(res);
        });

        freshData.playerData().then(function (res) {
            playerData = JSON.parse(res);
        });

        //kinda dumb, also a little dangerous... but this file will always be the largest so. prolly fine?
        return freshData.gameData().then(function (res) {
            gameData = JSON.parse(res);
        })
    }

    function _refreshData() {
        initData().then(function () {
            //all the data is now in them there variables. do a bunch of logic, boiiii
            //courses and players need to be updated before game data
            //actually psych, no they don't. its non relational. cmon man.

            updatePlayers();
            updateCourses();
            updateGameData();
        });
    }

    function updateGameData() {
        //soooo theres a few ways to do this.
        //the way that this whole thing has been written is based off of the assumption that the data is coming from my phone
        //so all the uuids will match up.  so if i wanted to integrate data from, for example, big T's phone... i would have to create a different service entirely, most likely.
            //side note, if i do every update from big T's, then my phone won't necessarily match up either? 
            //if i ever look into updating from big T's i should also look into exporting data from this app so that i can import into discores. exciting!
        //so lets just keep rolling with that fact.
        //still tho, there are two options.
        //bring in games with new uuids, and all the relating data
        // OR
        //bring in games that are newer than the newest game in the db. realistically this should return the same results

        //lets do the new uuids
        return dataService.getGames().then(function (res) {
            var currentGames = res;
            //map down to just uuids
            var currGameUuids = currentGames.map(function (currGame) {
                return currGame.uuid;
            });
            //find new games
            var newGames = gameData.games.filter(function (g) {
                return currGameUuids.indexOf(g.uuid) == -1;
            });
            
            //map down to just uuids
            var newGameUuids = newGames.map(function (newGame) {
                return newGame.uuid;
            });

            //find new gamePlayers
            var newGamePlayers = gameData.gamePlayers.filter(function (gp) {
                return newGameUuids.indexOf(gp.gameUuid) >= 0;
            });

            //find new gameHoles
            var newGameHoles = gameData.gameHoles.filter(function (gh) {
                return newGameUuids.indexOf(gh.gameUuid) >= 0;
            });

            //find new scores
            var newScores = gameData.scores.filter(function (s) {
                return newGameUuids.indexOf(s.gameUuid) >= 0;
            });

            //insert data
            if (newGames.length > 0) {
                var data = {
                    games: newGames,
                    gamePlayers: newGamePlayers,
                    gameHoles: newGameHoles,
                    scores: newScores
                }
                dataService.addNewGames(data);
            }

        });
    }

    function updateCourses() {
        //need to update courses and holes 
        return dataService.getCourses().then(function (res) {
            var currentCourses = res;
            //map down to just course names
            var currCourseNames = currentCourses.map(function(currCourse) {
                return currCourse.name;
            });

            //find new courses
            var newCourses = courseData.courses.filter(function (c) {
                return currCourseNames.indexOf(c.name) == -1;
            });

            //map down to just new course uuids
            var newCourseUuids = newCourses.map(function (newCourse) {
                return newCourse.uuid;
            });

            //find new holes
            var newHoles = courseData.holes.filter(function (h) {
                return newCourseUuids.indexOf(h.courseUuid) >= 0;
            });

            //insert data
            if (newCourses.length > 0) {
                dataService.addNewCourses(newCourses).then(function () {
                    dataService.addNewHoles(newHoles);
                });
            }
        });
    }

    function updatePlayers() {
        return dataService.getPlayers().then(function (res) {
            var currentPlayers = res;
            //map down to just player names
            var currPlayerNames = currentPlayers.map(function (currPlayer) {
                return currPlayer.name;
            });

            //find new players (by name)
            var newPlayers = playerData.players.filter(function (p) {
                return currPlayerNames.indexOf(p.name) == -1;
            });

            //insert data
            if (newPlayers.length > 0) {
                dataService.addNewPlayers(newPlayers);
            }
        })
    }

    return {
        doIt: _refreshData
    }
});