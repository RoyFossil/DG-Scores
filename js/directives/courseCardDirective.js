﻿angular.module('app.directives').directive('courseCard', ['charts', 'dataService', 'gameManip', function (charts, dataService, gameManip) {
    return {
        restrict: 'E',
        scope: {
            course: '='
        },
        templateUrl: 'js/directives/templates/courseCardDirective.html',
        link: function (scope, elt, attrs) {
            //default to overview tab
            scope.selectedTab = 'Overview';

            scope.allGames = [];
            scope.allGameUuids = [];
            scope.leaderboards = [];
            scope.gameCount = 0;
            scope.medianGameDuration;
            scope.medianScore;
            getAllGameUuids();

            //change the active tab, also run tab specific code, if it exists
            scope.navItemClicked = function (name) {
                //pushes change for body of card
                scope.selectedTab = name;
                //get all link items
                var linkItems = $("#courseCard" + scope.course.id + " span.nav-link");
                linkItems.removeClass("active");
                //make the selected link item active
                linkItems.filter(":contains('" + name + "')").addClass("active");


                //tab specific code
                if (name == "Charts") {
                    initCharts();
                }

                if (name == "All Games") {
                    initAllGames();
                }

                if (name == "Leaderboard") {
                    initLeaderboard();
                }
            }

            //thought i could do init one by one, but it looks like i should just init all games right off the bat
            //every tab is going to need information about all games in order to display anything useful.
            //can still separate out init charts until its navigated to, though.
            /*function initBaseData() {
                //refactor all of these inits. this is gross
                initAllGames().then(function () {
                    var avgGameDurMS = scope.allGames.reduce(function (accumulator, game) {
                        accumulator += game.duration;
                        return accumulator
                    });
                });
            }*/

            function initCharts() {
                if (scope.allGames.length == 0) {
                    initAllGames(initCharts);
                    return;
                }
                charts.daysOfWeekForCourse($('#chart1'), scope.allGames);
                charts.scoresOverTimeForCourse($('#chart2'), scope.allGames);
                charts.holeDifficulty($('#chart3'), scope.allGames);
            }

            function getAllGameUuids(callback) {
                dataService.getGameUuidsForCourse(scope.course.uuid).done(function (data) {
                    scope.allGameUuids = data;
                    scope.gameCount = scope.allGameUuids.length;
                    if (typeof callback === "function" && scope.allGameUuids.length != 0) {
                        callback();
                    }
                });
            }

            function initAllGames(callback) {
                if (scope.allGameUuids.length == 0) {
                    //base uuids have not yet been loaded, load em first then initAllGames
                    getAllGameUuids(initAllGames);
                    return;
                }

                if (scope.allGameUuids.length == scope.allGames.length) {
                    //already loaded
                    return;
                }

                var allDurations = [];
                var allScores = [];
                $.each(scope.allGameUuids, function (index, gameUuid) {
                    dataService.getGame(gameUuid).done(function (data) {
                        scope.allGames.push(data);
                        gameManip.getGameDuration(data);
                        allDurations.push(data.duration);
                        Array.prototype.push.apply(allScores, data.players.map(x => x.scoreRelToPar));
                        if (allDurations.length == scope.allGameUuids.length) {
                            scope.medianGameDuration = gameManip.msToHoursAndMinutes(findMedian(allDurations));
                            scope.medianScore = findMedian(allScores);
                            scope.allGames.sort(function (a, b) {
                                return b.startedAt - a.startedAt;
                            });
                            scope.$apply();
                            if (typeof callback === "function") {
                                callback();
                            }
                        }
                    });
                });
            }

            var leaderboardLoaded = false;
            function initLeaderboard() {
                if (scope.allGames.length == 0) {
                    initAllGames(initLeaderboard);
                    return;
                }

                if (!leaderboardLoaded) {

                    //Most Played
                    scope.leaderboards.push(getMostPlayedLeaderboard());
                    //getMostPlayedLeaderboard();
                    //Most Players (in a game)
                    //scope.leaderboards.push(getMostPlayerInGame());

                    //Lowest Score
                    scope.leaderboards.push(getLowestScores());

                    //Aces
                    leaderboardLoaded = true;
                }

            }

            function getMostPlayedLeaderboard() {
                //Most Played
                var mostPlayed = {
                    title: "Most Played",
                    items: []
                };
                var uuidTimesplayed = {};
                var uuidScores = {};
                var uuidToPlayerNames = {};
                var timesPlayedArr = [];
                for (var i = 0; i < scope.allGames.length; i++) {
                    for (var j = 0; j < scope.allGames[i].players.length; j++) {
                        var aPlayer = scope.allGames[i].players[j];
                        if (uuidTimesplayed[aPlayer.uuid]) {
                            uuidTimesplayed[aPlayer.uuid]++;
                        } else {
                            uuidTimesplayed[aPlayer.uuid] = 1;
                            uuidToPlayerNames[aPlayer.uuid] = aPlayer.name;
                        }
                    }
                }
                var uuidsSorted = Object.keys(uuidTimesplayed).sort(function (a, b) { return uuidTimesplayed[b] - uuidTimesplayed[a] });
                var i = 0;
                while (i < 3 && i < uuidsSorted.length) {
                    var leader = {
                        name: uuidToPlayerNames[uuidsSorted[i]],
                        info: uuidTimesplayed[uuidsSorted[i]]
                    }
                    mostPlayed.items.push(leader);
                    i++;
                }

                console.log(scope.allGames);

                return mostPlayed;
                //scope.leaderboards.push(mostPlayed);

            }

            /*function getMostPlayersInGame() {
                var mostPlayers = 
            }*/

            function getLowestScores() {

                var scoresList = [];
                for (var i = 0; i < scope.allGames.length; i++) {
                    for (var j = 0; j < scope.allGames[i].players.length; j++) {
                        var aPlayer = scope.allGames[i].players[j];
                        scoresList.push({
                            name: aPlayer.name,
                            score: aPlayer.scoreRelToPar,
                            info: aPlayer.formattedScore,
                            startedAt: scope.allGames[i].startedAt,
                            href: "/games/" + scope.allGames[i].uuid
                        })
                    }
                }
                console.log(scoresList);
                scoresList.sort(function (a, b) {
                    return a.score - b.score != 0 ? a.score - b.score : b.startedAt - a.startedAt;
                });
                
                var lowestScoreLeaderboard = {
                    title: "Low Scores",
                    items: scoresList.splice(0, 3)
                }
                var remainingScores = scoresList.length - lowestScoreLeaderboard.items.length;

                if (lowestScoreLeaderboard.items.length >= 3) {
                    var dupes = checkLowScoreDupe(lowestScoreLeaderboard.items[0], lowestScoreLeaderboard.items[1]) ||
                        checkLowScoreDupe(lowestScoreLeaderboard.items[1], lowestScoreLeaderboard.items[2]); 
                    while (dupes && remainingScores > 0) {
                        var firstItem = lowestScoreLeaderboard.items[0];
                        var secondItem = lowestScoreLeaderboard.items[1];
                        if (checkLowScoreDupe(firstItem, secondItem)) {
                            lowestScoreLeaderboard.items.splice(1, 1);
                            lowestScoreLeaderboard.items.push(scoresList.splice(0, 1)[0]);
                            remainingScores--;
                        } else {
                            var thirdItem = lowestScoreLeaderboard.items[2];
                            if (checkLowScoreDupe(secondItem, thirdItem)) {
                                lowestScoreLeaderboard.items.splice(2, 1);
                                lowestScoreLeaderboard.items.push(scoresList.splice(0, 1)[0]);
                                remainingScores--;
                            } else {
                                dupes = false;
                            }
                        }
                        dupes = checkLowScoreDupe(lowestScoreLeaderboard.items[0], lowestScoreLeaderboard.items[1]) ||
                            checkLowScoreDupe(lowestScoreLeaderboard.items[1], lowestScoreLeaderboard.items[2]);
                    }
                }

                return lowestScoreLeaderboard;
            }

            function checkLowScoreDupe(a, b) {
                return a.name == b.name && a.score == b.score;
            }

            function findMedian(arr) {
                var median;
                arr.sort(function (a, b) { return a - b; });
                if (arr.length % 2 == 0) {
                    //need average of two center values
                    median = (arr[arr.length / 2] + arr[arr.length / 2 - 1]) / 2;
                } else {
                    //just take the center value
                    median = arr[(arr.length - 1) / 2];
                }
                return median;
            }

            initAllGames();
        }
    }
}]);