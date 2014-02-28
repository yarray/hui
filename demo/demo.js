angular.module('app', [
        'higis.hui.tagList',
        'higis.hui.contextCircle',
        'higis.hui.thumbGrid',
        'higis.hui.tileWall'
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
            { name: 'grey' },
            { name: 'blue' },
            { name: 'red' },
            { name: 'red' },
            { name: 'grey' },
            { name: 'blue' },
            { name: 'grey' },
            { name: 'blue' }
        ];
        $scope.grid = {
            model: {
                name: function (obj) {
                    return obj.name;
                },
                thumbnailUrl: function (obj) {
                    return 'images/' + obj.name + '.png';
                },
                data: function () {
                    return list;
                },
                select: function (value) {
                    if (selectedGridItem !== value) {
                        selectedGridItem = value;
                    } else {
                        selectedGridItem = -1;
                    }
                },
                selected: function () {
                    return selectedGridItem;
                },
                height: 200
            },
            msg: function() {
                if (selectedGridItem < 0) {
                    return '';
                } else {
                    return selectedGridItem + 1 + ' is expanded';
                }
            }
        };

        $scope.tiles = {
            // TODO tedious interface, need refactoring
            tileWalls: {
                1: {show: true},
                2: {show: true},
                3: {show: true},
                4: {show: true}
            },
            beforeShown: function(name) { $scope.tiles.msg = name + ' is showing'; },
            afterShown: function(name) { $scope.tiles.msg = name + ' is shown'; $scope.$apply(); }
        };
    });
