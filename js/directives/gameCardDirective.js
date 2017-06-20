angular.module('app.directives').directive('gameCard', function () {
    return {
        restrict: 'E',
        scope: {
            game: '='
        },
        templateUrl: 'js/directives/templates/gameCardDirective.html',
    }
})