angular.module('app.directives').directive('score', function () {
    return {
        restrict: 'E',
        scope: {
            score: '='
        },
        templateUrl: 'js/directives/templates/scoreDirective.html',
        link: function (scope, elt, attrs) {
            var theScoreDiv = $(elt).children().first();

            if (scope.score.score == 1) {
                //it was a flippin ACE
                theScoreDiv.addClass('ace')
            } else if(scope.score.score == 0) {
                theScoreDiv.addClass('invisible')
            } else {
                //it was not an ace.
                switch (scope.score.score - scope.score.par) {
                    case -4:
                        //condor???
                        theScoreDiv.addClass('birdjesus')
                        break;
                    case -3:
                        //albatross
                        theScoreDiv.addClass('albatross')
                        break;
                    case -2:
                        //eagle
                        theScoreDiv.addClass('eagle')
                        break;
                    case -1:
                        //birdie
                        theScoreDiv.addClass('birdie')
                        break;
                    case 0:
                        //par
                        theScoreDiv.addClass('par')
                        break;
                    case 1:
                        //bogey
                        theScoreDiv.addClass('bogey')
                        break;
                    case 2:
                        //double bogey
                        theScoreDiv.addClass('double')
                        break;
                    case 3:
                        //triple bogey
                        theScoreDiv.addClass('triple')
                        break;
                    default:
                        //too many to count LOL
                        theScoreDiv.addClass('toomany')
                        break;
                }
            }

        }
    }
})