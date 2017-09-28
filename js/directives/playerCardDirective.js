angular.module('app.directives').directive('playerCard', ['dataService', function (dataService) {
    return {
        restrict: 'E',
        scope: {
            player: '='
        },
        templateUrl: 'js/directives/templates/playerCardDirective.html',
        link: function (scope, element, attrs) {
            scope.$watch('player', function (newValue, oldValue) {
                if (scope.player.uuid) {
                    dataService.getNumGamesPlayed(scope.player.uuid).done(function (count) {
                        scope.player.numGamesPlayed = count;
                        scope.$apply();
                    });
                    dataService.getNumGamesWon(scope.player.uuid).done(function (count) {
                        scope.player.numGamesWon = count;
                        scope.player.WLratio = ((scope.player.numGamesWon / scope.player.numGamesPlayed) * 100).toFixed(1) + '%';
                        scope.$apply();
                    });
                    dataService.getMostRecentGameUuid(scope.player.uuid).done(function (data) {
                        scope.player.mostRecentGameUuid = data.gameUuid;
                    });
                    dataService.getCourseCount(scope.player.uuid).done(function (courses) {
                        scope.player.courseCount = courses;
                    });
                    if (scope.selectedTab == 'All Games') {
                        initAllGames();
                    }
                    if (scope.selectedTab == 'Best Games') {
                        initBestGames();
                    }
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
                dataService.getAllGamesForPlayer(scope.player.uuid).then(function (res) {
                    scope.player.games = res;
                    scope.$apply();
                })
            }

            function initBestGames() {
                dataService.getBestGamesForPlayer(scope.player.uuid).then(function (res) {
                    scope.player.bestGames = res;
                    scope.$apply();
                })
            }

        }
    }
}])