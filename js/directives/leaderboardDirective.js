angular.module('app.directives').directive('leaderboard', function () {
    return {
        restrict: 'E',
        scope: {
            lb: '='
        },
        templateUrl: 'js/directives/templates/leaderboardDirective.html',
        link: function (scope, elt, attrs) {
            for (var i = 0; i < scope.lb.items.length; i++) {
                scope.lb.items[i].isLink = scope.lb.items[i].hasOwnProperty('href');
            }
            console.log(scope.lb);
        }
    }
})