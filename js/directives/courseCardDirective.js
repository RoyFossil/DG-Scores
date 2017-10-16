angular.module('app.directives').directive('courseCard', ['charts', 'dataService', 'gameManip', function (charts, dataService, gameManip) {
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
            scope.gameCount = 0;
            scope.medianGameDuration;
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
                    getAllGameUuids(initAllGames);
                    return;
                }
                return dataService.getGameInfoFromUuids(scope.allGameUuids).done(function (data) {
                    scope.allGames = data;
                    var allDurations = [];
                    $.each(scope.allGames, function (index, game) {
                        gameManip.getGameDuration(game);
                        allDurations.push(game.duration);
                    });
                    //maybe instead of average, go with median? i might have some really weird outliers here, like when i get scores from big t so a game takes like 2 min
                    //or when i hold off on ending a game for whatever reason, so a game is like 8 hours long. idk, think about it.
                    scope.medianGameDuration = gameManip.msToHoursAndMinutes(findMedian(allDurations));
                    scope.$apply();
                    if (typeof callback === "function") {
                        callback();
                    }
                });

            }

            function initLeaderboard() {
                if (scope.allGameUuids.length == 0) {
                    getAllGameUuids(initLeaderboard);
                    return;
                }
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