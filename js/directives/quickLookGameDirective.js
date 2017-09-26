angular.module('app.directives').directive('quickLookGame', function () {
    return {
        restrict: 'A',
        scope: {
            game: '=',
            currPlayer: '=?'
        },
        templateUrl: 'js/directives/templates/quickLookGameDirective.html',
        link: function (scope, elt, attrs) {
            scope.game.date = moment(parseInt(scope.game.startedAt)).format("ddd, MMM D Y h:mm A");
            scope.game.allPlayers = scope.game.players.map(x => x.name).sort(function (a, b) {
                if (scope.currPlayer) {
                    if(a == scope.currPlayer.name)
                        return -1
                    if(b == scope.currPlayer.name)
                        return 1
                    return a.toLowerCase().localeCompare(b.toLowerCase())
                }
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }).join(", ");
        }
    }
});