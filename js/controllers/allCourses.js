angular.module('app.controllers').
controller('allCoursesCtrl', function ($scope, dataService) {
    $scope.allCourses = [];
    dataService.getCourses().done(function (data) {
        $scope.allCourses = data;
        $scope.$apply();
    })


    $(function () {
        $('#coursesCarousel').carousel(0);
    });
});