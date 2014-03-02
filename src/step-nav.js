angular.module('higis.hui.stepNav', ['higis.hui.config'])
    .directive('stepNavBar', function (Config) {
        'use strict';
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                nameField: '=',
                path: '='
            },
            transclude: true,
            link: function (scope) {
                scope.backToLevel = function (level) {
                    scope.path.splice(level + 1, scope.path.length);
                };
            },
            templateUrl: Config.root + 'templates/step-nav-bar.html'
        };
    })

    .directive('stepNav', function (Config) {
        'use strict';
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                // getChildren(node, function(children -> array) {...} )
                getChildren: '=',
                nameField: '=',
                path: '=',
                nextNodes: '='
            },
            link: function (scope) {
                scope.$watch('path', function () {
                    if (scope.path === undefined || scope.path.length === 0) {
                        return;
                    }

                    navToNext(scope.path[scope.path.length - 1]);
                }, true);

                var replaceWith = function (oldList, newList) {
                    oldList.splice(0, oldList.length);
                    oldList.push.apply(oldList, newList);
                };

                var navToNext = function (item) {
                    scope.current = item;
                    scope.getChildren(item, function (children) {
                        // calculate parents according to whether item is a leaf node; parents always contains root node
                        if (children.length > 0 || scope.path.length === 1) {
                            scope.parents = scope.path.slice(0, scope.path.length);
                            replaceWith(scope.nextNodes, children);
                        } else {
                            scope.parents = scope.path.slice(0, scope.path.length - 1);
                            scope.getChildren(scope.parents[scope.parents.length - 1], function(siblings) {
                                replaceWith(scope.nextNodes, siblings);
                            });
                        }
                    });
                };

                scope.navTo = function (item) {
                    // new path is always equal to parents added by current item
                    scope.path = scope.parents.concat(item);
                };
            },
            templateUrl: Config.root  + 'templates/step-nav.html'
        };
    });
