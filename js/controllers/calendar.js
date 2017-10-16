angular.module('app.controllers').
controller('calendarCtrl', function ($scope, dataService) {

    dataService.getGames().then(function (data) {
        var allGames = data;

        $.each(allGames, function (index, game) {
            game.title = "issa game";
            game.start = parseInt(game.startedAt);
        })


        $("#calendar").fullCalendar({
            events: allGames,
            timezone: 'local'
        });
    });
});