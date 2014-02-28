angular.module('app', [
        'higis.hui.tagList',
        'higis.hui.contextCircle',
        'higis.hui.thumbGrid'
    ])
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

        var selectedGridItem = -1;
        var list = [
            { name: 'red' },
            { name: 'green' },
            { name: 'blue' },
            { name: 'red' },
            { name: 'red' },
            { name: 'green' },
            { name: 'blue' },
            { name: 'green' },
            { name: 'blue' }
        ];
        $scope.grid = {
            name: function (obj) {
                return obj.name;
            },
            thumbnailUrl: function (obj) {
                return 'images/red.png';
            },
            data: function () {
                return list;
            },
            select: function (value) {
                selectedGridItem = value;
            },
            selected: function () {
                return selectedGridItem;
            },
            height: 200
        }
    });
