angular.module('app.directives').directive('playerCard', ['dataService', function (dataService) {
    return {
        restrict: 'E',
        scope: {
            player: '='
        },
        templateUrl: 'js/directives/templates/playerCardDirective.html',
        link: function (scope, element, attrs) {
            
            scope.$watch('player', function (newValue, oldValue) {
                if (newValue.uuid && newValue.uuid != oldValue) {
                    scope.games = [];
                    scope.courses = [];
                    scope.gameUuids = [];
                    initAllGames();
                }
            });

            //default to overview tab
            scope.selectedTab = 'Overview';

            //change the active tab, also run tab specific code, if it exists
            scope.navItemClicked = function (name) {
                //pushes change for body of card
                scope.selectedTab = name;
                //get all link items
                var linkItems = $("#playerCard" + scope.player.id + " span.nav-link");
                linkItems.removeClass("active");
                //make the selected link item active
                linkItems.filter(":contains('" + name + "')").addClass("active");


                //tab specific code
                if (name == "All Games") {
                    initAllGames();
                }

                if (name == "Best Games") {
                    initBestGames();
                }
            }

            function initAllGames() {
                if (scope.gameUuids.length == 0) {
                    dataService.getAllGameUuidsForPlayer(scope.player.uuid).then(function (res) {
                        scope.gameUuids = res;
                        for (var i = 0; i < scope.gameUuids.length; i++) {
                            dataService.getGame(scope.gameUuids[i]).then(function (res) {
                                scope.games.push(res);
                                if (scope.games.length == scope.gameUuids.length) {
                                    //all games have been fully loaded
                                    //calc some overview data

                                    scope.player.numGamesPlayed = scope.gameUuids.length;
                                    scope.player.numGamesWon = 0;
                                    scope.player.bestGames = [];

                                    var courseCount = {};
                                    var minScoreForCourse = {};

                                    var newestGameStartedAt = 0;
                                    for (var i = 0; i < scope.games.length; i++) {
                                        var aGame = scope.games[i];

                                        //count wins
                                        if (isWinner(aGame)) {
                                            scope.player.numGamesWon++;
                                        }
                                        //get most recent game
                                        if (aGame.startedAt > newestGameStartedAt) {
                                            newestGameStartedAt = aGame.startedAt;
                                            scope.player.mostRecentGameUuid = aGame.uuid;
                                        }
                                        //tally course play counts
                                        if (courseCount[aGame.course.uuid]) {
                                            //increment course count
                                            courseCount[aGame.course.uuid]++;


                                            //get specific playerGame
                                            var playerGame = aGame.players.find(function (p) {
                                                return p.uuid == scope.player.uuid;
                                            });
                                            //check against prev best course
                                            if (sortGames(playerGame, minScoreForCourse[aGame.course.uuid]) < 0) {
                                                //this game is better
                                                minScoreForCourse[aGame.course.uuid] = {
                                                    holesPlayed: playerGame.holesPlayed,
                                                    totalScore: playerGame.totalScore,
                                                    startedAt: aGame.startedAt,
                                                    game: aGame
                                                }
                                            }
                                        } else {
                                            //initialize course count
                                            courseCount[aGame.course.uuid] = 1;
                                            //push course to courses list
                                            scope.courses.push(aGame.course);
                                            //get specific playerGame
                                            var playerGame = aGame.players.find(function (p) {
                                                return p.uuid == scope.player.uuid;
                                            });
                                            //initialize best score for course
                                            minScoreForCourse[aGame.course.uuid] = {
                                                holesPlayed: playerGame.holesPlayed,
                                                totalScore: playerGame.totalScore,
                                                startedAt: aGame.startedAt,
                                                game: aGame
                                            }
                                        }
                                    }
                                    scope.player.WLratio = ((scope.player.numGamesWon / scope.player.numGamesPlayed) * 100).toFixed(1) + '%';
                                    var mostPlayedCourseUuid = Object.keys(courseCount).sort(function (a, b) {
                                        return courseCount[b] - courseCount[a];
                                    })[0];

                                    var maxCount = 0;
                                    for (var i = 0; i < scope.courses.length; i++) {
                                        scope.courses[i].count = courseCount[scope.courses[i].uuid];
                                        if (scope.courses[i].count > maxCount) {
                                            scope.player.mostPlayedCourse = scope.courses[i];
                                            maxCount = scope.courses[i].count;
                                        }
                                        scope.player.bestGames.push(minScoreForCourse[scope.courses[i].uuid].game);
                                    }

                                    scope.games.sort(function (a, b) {
                                        return b.startedAt - a.startedAt;
                                    });

                                    scope.player.bestGames.sort(function (a, b) {
                                        return a.course.name.localeCompare(b.course.name);
                                    });

                                    scope.$apply();
                                }
                            })
                        }
                        //scope.$apply();
                    });
                }
            }

            function sortGames(a, b) {
                if (b.holesPlayed != a.holesPlayed) {
                    //more holes played is more important
                    return b.holesPlayed - a.holesPlayed;
                } else if (a.totalScore != b.totalScore) {
                    //if holes are equal, then lower score is better
                    return a.totalScore - b.totalScore;
                } else if (b.startedAt && a.startedAt) {
                    return b.startedAt - a.startedAt;
                } else {
                    return 0;
                }
            }

            //takes a game obj, returns true or false base on if player won
            function isWinner(aGame) {
                aGame.players.sort(sortGames);
                if (aGame.players[0].uuid == scope.player.uuid) {
                    return true;
                } else {
                    var i = 1;
                    //while the next player still has the same score (and holes played)...
                    while (i < aGame.players.length && aGame.players[i].holesPlayed == aGame.players[0].holesPlayed && aGame.players[i].totalScore == aGame.players[0].totalScore) {
                        if (aGame.players[i].uuid == scope.player.uuid) {
                            return true;
                        } else {
                            i++;
                        }
                    }
                    return false;
                }
            }

            function initBestGames() {
                /*dataService.getBestGamesForPlayer(scope.player.uuid).then(function (res) {
                    scope.player.bestGames = res;
                    scope.$apply();
                })*/
            }

        }
    }
}])