angular.module('app.controllers').
controller('calendarCtrl', function ($scope, dataService) {

    dataService.getGames().then(function (data) {
        var allGames = data;

        $.each(allGames, function (index, game) {
            game.title = "issa game";
            game.start = parseInt(game.startedAt);
            game.url = "/games/" + game.uuid;
        })


        $("#calendar").fullCalendar({
            events: allGames,
            timezone: 'local'/*,
            eventClick: function (event) {
                //window.location.href = "games/" + event.uuid;
                /*window.history.pushState({}, null, "/games/" + event.uuid);
                window.location.reload(true);
                var aTag = document.createElement('a');
                aTag.setAttribute('href', "/games/" + event.uuid);
                aTag.click();

            }*/
        });
    });
});