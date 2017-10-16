angular.module('app.services').
factory('gameManip', function () {

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


    return {
        getGameDuration: _getGameDuration,
        //is this bad practice?
        msToHoursAndMinutes: msToHoursAndMinutes
    }
});