angular.module('app', [
        'higis.hui.tagList',
        'higis.hui.stepNav',
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

        var tree = {
            name: 'root',
            children: [
                { name: '1', children: [
                    { name: '1.1' },
                    { name: '1.2' },
                    { name: '1.3' }
                ]},
                { name: '2', children: [
                    { name: '2.1' },
                    { name: '2.2' }
                ]},
                { name: '3' }
            ]
        };

        $scope.nav = {
            path: [tree],
            nextNodes: tree.children.slice(0, tree.children.length),
            // Here callback is used rather than direct return. This api is designed like this to be compatible with ajax
            getChildren: function (node, callback) {
                if (node.children === undefined || node.children.length === 0) {
                    callback([]);
                } else {
                    callback(node.children.slice(0, node.children.length));
                }
                $scope.nav.pathMsg = 'path changed to ' + _.reduce(_.pluck($scope.nav.path, 'name'), function(memo, node) {
                    return memo + ' -> ' + node;
                });
                $scope.nav.nextMsg = 'next can be ' + _.reduce(_.pluck($scope.nav.nextNodes, 'name'), function(memo, node) {
                    return memo + ', ' + node;
                });
            },
            go: function (dest) {
                $scope.nav.path.splice(1, $scope.nav.path.length);
                (function stepIn(path, desc) {
                    if (desc.length === 0) {
                        return path;
                    } else {
                        path.push(
                            path[path.length - 1]
                                .children[desc.shift() - 1]
                        );
                        return stepIn(path, desc);
                    }
                })($scope.nav.path, dest.split('.'));
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
            msg: function () {
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
            beforeShown: function (name) {
                $scope.tiles.msg = name + ' is showing';
            },
            afterShown: function (name) {
                $scope.tiles.msg = name + ' is shown';
            }
        };
    });
