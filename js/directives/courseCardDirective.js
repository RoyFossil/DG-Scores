angular.module('app.directives').directive('courseCard', ['charts', 'dataService', function (charts, dataService) {
    return {
        restrict: 'E',
        scope: {
            course: '='
        },
        templateUrl: 'js/directives/templates/courseCardDirective.html',
        link: function (scope, elt, attrs) {
            //default to overview tab
            scope.selectedTab = 'Overview';

            scope.allGameUuids = [];
            scope.gameCount = 0;
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


            function initCharts() {
                //charts.scoresRelToParForGame($('#chart1'), scope.game);
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

            function initAllGames() {
                if (scope.allGameUuids.length == 0) {
                    getAllGameUuids(initAllGames);
                    return;
                }
                dataService.getGameInfoFromUuids(scope.allGameUuids).done(function (data) {
                    scope.allGames = data;
                    scope.$apply();
                });

            }

            function initLeaderboard() {
                if (scope.allGameUuids.length == 0) {
                    getAllGameUuids(initLeaderboard);
                }
            }
        }
    }
}]);