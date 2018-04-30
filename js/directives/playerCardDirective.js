angular.module('app.directives').directive('playerCard', ['charts', 'gameManip', 'dataService', function (charts, gameManip, dataService) {
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
                    scope.superGame = {};
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

                if (name == "SuperGames") {
                    initSuperGames();
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

            function initCourseSpecificCharts() {
                var selectedCourseUuid = $('#courseSelect')[0].value;
                charts.scoresOverTimeForPlayerAtCourse($('#chart5'), scope.games, scope.player.uuid, selectedCourseUuid);
                charts.scoreBreakdownForPlayerAtCourse($('#chart6'), scope.games, scope.player.uuid, selectedCourseUuid);

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

                $('#courseSelect')[0].addEventListener("change", initCourseSpecificCharts);

                initCourseSpecificCharts();
                //another bite off the courseCard swag, prolly include the holeDifficulty chart.  avgs and pars and ish.
                //not sure if this is viable........ but. a slider?? to show change??? no way. thats too much work.


                //games per week chart? line? column? maybe per month instead of per week
                //would look good on courseCard too


                //course difficulty ranking, based on median score probably?
            }
            $('#courseSelectSG')[0].addEventListener("change", initSuperGames);
            function initSuperGames() {
                scope.superGame = {};
                var selectedCourseUuid = $('#courseSelectSG')[0].value;
                var player = {
                    name: scope.player.name,
                    //this is a made up game player, just need this in here for reference
                    gamePlayerUuid: "superman",
                    totalScore: 0
                };

                //pull in player
                scope.superGame.players = [player];

                //pull in course
                var course = {};

                var gameHoles = {};
                var scores = {};

                //pull in course holes... how to determine which par to take? prolly the one that is matched with the lowest score
                for (var i = 0; i < scope.games.length; i++) {
                    //loop through every game
                    var aGame = scope.games[i];

                    if (aGame.course.uuid == selectedCourseUuid) {
                        //only look at the selected course
                        //update course name
                        course.name = aGame.course.name;

                        //get actual gamePlayerUuid for this player on this course
                        var gamePlayerUuid;
                        for (var j = 0; j < aGame.players.length; j++) {
                            if (aGame.players[j].uuid == scope.player.uuid) {
                                gamePlayerUuid = aGame.players[j].gamePlayerUuid;
                            }
                        }


                        for (var j = 0; j < aGame.gameHoles.length; j++) {
                            //loop through each gamehole
                            var aGameHole = aGame.gameHoles[j];
                            for (var k = 0; k < aGameHole.scores.length; k++) {
                                //loop through each score
                                var aScore = aGameHole.scores[k];
                                if (aScore.gamePlayerUuid == gamePlayerUuid) {
                                    //only care about scores from this player

                                    //logic

                                    //check to see if this hole has an entry already
                                    if (scores[aGameHole.hole]) {
                                        //if it does, compare scores
                                        if (scores[aGameHole.hole].score > aScore.score) {
                                            //this new score is better, take these objs
                                            gameHoles[aGameHole.hole] = {
                                                hole: aGameHole.hole,
                                                par: aGameHole.par
                                            }
                                            scores[aGameHole.hole] = {
                                                gamePlayerUuid: player.gamePlayerUuid,
                                                score: aScore.score
                                            }
                                        }
                                    } else {
                                        //if it doesn't, add entries (carefully)
                                        gameHoles[aGameHole.hole] = {
                                            //don't want to take the whole object, just a few important attrs
                                            hole: aGameHole.hole,
                                            par: aGameHole.par
                                        }

                                        scores[aGameHole.hole] = {
                                            gamePlayerUuid: player.gamePlayerUuid,
                                            score: aScore.score
                                        }
                                    }

                                }
                            }
                        }
                    }
                }

                //have gameHoles, scores.  now need to add them to superGame obj
                scope.superGame.course = course;
                scope.superGame.course.totalPar = 0;

                //create sorted list of hole numbers
                var sortedGameHolesArr = Object.keys(gameHoles).map(x => parseInt(x)).sort(function (a, b) {
                    return a - b;
                });
                scope.superGame.gameHoles = [];

                var prevScoreRelToPar = 0;
                for (var i = 0; i < sortedGameHolesArr.length; i++) {
                    //get this specific game hole
                    var thisGameHole = gameHoles[sortedGameHolesArr[i]];
                    //prep the scores arr
                    thisGameHole.scores = [];

                    //increment total par for course
                    scope.superGame.course.totalPar += thisGameHole.par;

                    //get specific score
                    var thisScore = scores[sortedGameHolesArr[i]];
                    //increment player total score
                    scope.superGame.players[0].totalScore += thisScore.score;

                    //calculate running scoreRelToPar
                    thisScore.scoreRelToPar = prevScoreRelToPar + (thisScore.score - thisGameHole.par);
                    //save for next hole
                    prevScoreRelToPar = thisScore.scoreRelToPar;
                    //get formatted score
                    thisScore.formattedScoreRelToPar = gameManip.formatScore(thisScore.scoreRelToPar);

                    //push the score to the hole
                    thisGameHole.scores.push(thisScore);

                    //push the hole to the game
                    scope.superGame.gameHoles.push(thisGameHole);
                }

                //get player final score formatted
                scope.superGame.players[0].formattedScore = gameManip.formatScore(scope.superGame.players[0].totalScore - scope.superGame.course.totalPar);

                scope.$broadcast("SuperGameChanged", scope.superGame);
            }

        }
    }
}])