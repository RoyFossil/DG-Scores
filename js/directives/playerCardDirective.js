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
                }
            });

        }
    }
}])