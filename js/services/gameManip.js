angular.module('app.services').
factory('gameManip', function () {

    //maybe gameManip is a bad name...

    function msToHoursAndMinutes(ms) {
        var timeString = "";
        var hours = Math.floor(ms / 3600000);
        var mins = Math.round((ms % 3600000) / 60000)

        if (hours == 1) {
            timeString += "1hr";
        } else if (hours > 1) {
            timeString += hours + "hrs";
        }

        if (mins > 1) {
            timeString += mins + "mins";
        } else {
            timeString += mins + "min";
        }

        return timeString;
    }

    function _getGameDuration(game) {
        game.duration = game.endedAt - game.startedAt;
        game.formatted_duration = msToHoursAndMinutes(game.duration);
    }

    function _formatScore(score) {
        if (score > 0) {
            return '+' + score.toString();
        } else if (score < 0) {
            return score.toString();
        } else {
            return 'E';
        }
    }


    function _getScoreNameFromDiff(diff) {
        switch (diff) {
            case -4:
                return "Condor";
            case -3:
                return "Albatross";
            case -2:
                return "Eagle";
            case -1:
                return "Birdie";
            case 0:
                return "Par";
            case 1:
                return "Bogey";
            case 2:
                return "Double Bogey";
            case 3:
                return "Triple Bogey";
            default:
                return "4+ over";
        }
    }

    function _getScoreName(par, score) {
        if (score == 1) {
            return "Ace";
        }
        return _getScoreNameFromDiff(score - par);
    }


    return {
        getGameDuration: _getGameDuration,
        //is this bad practice?
        msToHoursAndMinutes: msToHoursAndMinutes,
        formatScore: _formatScore,
        getScoreName: _getScoreName,
        getScoreNameFromDiff: _getScoreNameFromDiff
    }
});