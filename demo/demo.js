angular.module('app', [
        'higis.hui.tagList'])
    .controller('DemoCtrl', function ($scope) {
        'use strict';
        $scope.tags = {
            data: ['painting', 'music', 'literature'],
            selected: function (selected) {
                if (selected.length === 0) {
                    $scope.tags.msg = '';
                } else {
                    $scope.tags.msg = selected.toString().replace(/,/g, ', ') + (selected.length > 1 ? ' are' : ' is') + ' selected';
                }
            }
        };
    });
