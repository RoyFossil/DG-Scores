angular.module('app.directives').directive('playerCard', ['charts', 'dataService', function (charts, dataService) {
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

                if (name == "Charts") {
                    initCharts();
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

            function initCharts() {
                if (scope.games.length == 0) {
                    initAllGames(initCharts);
                    return;
                }
                //days of week for player would be cool
                //other thoughts... could do days of week for a specific year? allow user to select year, to see change
                //maybe even fux with that diff pie chart. just some thoughts
                charts.daysOfWeekForCourse($('#chart1'), scope.games);
                charts.coursesPlayedCount($('#chart2'), scope.courses);
                charts.numPeopleInGame($('#chart3'), scope.games);
                charts.playersPlayedWith($('#chart4'), scope.games, scope.player.uuid);

                //another great one per player, scores at course over time. just like the one on the courses page (with all the blue dots)
                //could show improvement? actually. prolly better represented as a line chart. might be a little weird on days with double play?
                //maybe just include time as well. 
                //but make it something like.. default to fav course, then have dropdown for selecting course. showing multiple courses is a little overkill. 
                //could be saved for a compare page.
                charts.scoresOverTimeForPlayerAtCourse($('#chart5'), scope.games, scope.player.uuid, scope.player.mostPlayedCourse.uuid);

                //another bite off the courseCard swag, prolly include the holeDifficulty chart.  avgs and pars and ish.
                //not sure if this is viable........ but. a slider?? to show change??? no way. thats too much work.


                //games per week chart? line? column? maybe per month instead of per week
                //would look good on courseCard too

                //pie chart of ace, bird, par, boge etc per player per course


                //course difficulty ranking, based on median score probably?
            }

        }
    }
}])