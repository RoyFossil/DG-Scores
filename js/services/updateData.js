angular.module('app.services').factory('updateData', function (freshData, dataService) {

    var courseData, playerData, gameData;

    function initData() {

        freshData.courseData().then(function (res) {
            courseData = JSON.parse(res);
        });

        freshData.playerData().then(function (res) {
            playerData = JSON.parse(res);
        });

        return freshData.gameData().then(function (res) {
            gameData = JSON.parse(res);
        })
    }

    function _refreshData() {
        initData().then(function () {
            //all the data is now in them there variables. do a bunch of logic, boiiii
            //courses and players need to be updated before game data
            //players first


            //updatePlayers();
            updateCourses();
            //updateGameData();

        });
    }

    function updateGameData() {
        //soooo theres a few ways to do this.
        //the way that this whole thing has been written is based off of the assumption that the data is coming from my phone
        //so all the uuids will match up.  so if i wanted to integrate data from, for example, big T's phone... i would have to create a different service entirely, most likely.
        //so lets just keep rolling with that fact.
        //still tho, there are two options.
        //bring in games with new uuids, and all the relating data
        // OR
        //bring in games that are newer than the newest game in the db. realistically this should return the same results

        //lets do the new uuids
        return dataService.getGames().then(function (res) {
            var currentGames = res;
            var newGames = findNew(currentGames, gameData.games, "uuid", "uuid", true);
            var newGameUuids = newGames.map(function (newGame) {
                return newGame.uuid;
            });
            var newGamePlayers = gameData.gamePlayers.filter(function (gp) {
                return newGameUuids.indexOf(gp.gameUuid) >= 0;
            });

            var newGameHoles = gameData.gameHoles.filter(function (gh) {
                return newGameUuids.indexOf(gh.gameUuid) >= 0;
            });

            var newScores = gameData.scores.filter(function (s) {
                return newGameUuids.indexOf(s.gameUuid) >= 0;
            });
        });
    }

    function updateCourses() {
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


            if (newCourses.length > 0) {
                dataService.addNewCourses(newCourses).then(function () {
                    dataService.addNewHoles(newHoles);
                });
            }
            dataService.addNewHoles(newHoles);
        });
    }

    function updatePlayers() {
        return dataService.getPlayers().then(function (res) {
            var currentPlayers = res;
            //find new players (by name)
            var newPlayers = findNew(currentPlayers, playerData.players, "name", "name", true)
        })
    }

    //this whole thing is pretty dumb tbh
    //takes two arrays, currently existing objs and "new" objs (quotes because the new objs may already exist in curr)
    //also takes the names of the properties to compare against
    //returns an array containing the subset of the new objs that are actually new, based on the property comparison
    function findNew(currArr, newArr, currProp, newProp, dontmatch) {
        var newOnes = [];
        //might be a better way to do this... some fancy map function or something. oh well.
        //loop through all "new objs"
        for (var i = 0; i < newArr.length; i++) {
            //try to match each one with one of the curr objs
            var matched = false;
            for (var j = 0; j < currArr.length; j++) {
                //classic i and j boi
                if ((newArr[i][newProp] == currArr[j][currProp]) == dontmatch) {
                    matched = true;
                    if(dontmatch)
                        break;
                }
            }
            if (!matched) {
                newOnes.push(newArr[i]);
            }
        }
        return newOnes;
    }


    return {
        doIt: _refreshData
    }
});