angular.module('app.directives').directive('gameCard', ['charts', function (charts) {
    return {
        restrict: 'E',
        scope: {
            game: '='
        },
        templateUrl: 'js/directives/templates/gameCardDirective.html',
        link: function (scope, elt, attrs) {
            //default to overview tab
            scope.selectedTab = 'Overview';

            //change the active tab, also run tab specific code, if it exists
            scope.navItemClicked = function (name) {
                //pushes change for body of card
                scope.selectedTab = name;
                //get all link items
                var linkItems = $("#gameCard" + scope.game.id + " span.nav-link");
                linkItems.removeClass("active");
                //make the selected link item active
                linkItems.filter(":contains('" + name + "')").addClass("active");


                //tab specific code
                if (name == "Charts") {
                    initCharts();
                }
            }


            function initCharts() {
                charts.scoresRelToParForGame($('#chart1'), scope.game);
            }
        }
    }
}]);