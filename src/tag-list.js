// depend on underscore.js
angular.module('higis.hui.tagList', ['higis.hui.config']).directive('tagList', function (Config) {
    'use strict';
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: Config.root + 'templates/tag-list.html',
        scope: {
            tagSelected: '=',
            tagClear: "=",
            tags: '='
        },
        link: function (scope) {
            scope.selected = [];
            scope.tagClear = function () {
                scope.selected = [];
                _.each(scope.stats, function (value, key) {
                    scope.stats[key] = false;
                });

                scope.tagSelected(scope.selected);
            };

            function toggleSelected(tag) {
                if (tag.name in scope.stats) {
                    return;
                }
                scope.stats[tag] = !scope.stats[tag];
            }

            function indexInSelected(tag) {
                return _.indexOf(
                    _.map(scope.selected, function (item) {
                        return item;
                    }), tag);
            }

            function changed(tag) {
                toggleSelected(tag);
                scope.tagSelected(scope.selected);
            }

            scope.isSelected = function (tag) {
                return scope.stats[tag];
            };

            scope.addTag = function (tag) {
                scope.selected.push(tag);
                changed(tag);
            };

            scope.closeTag = function (tag) {
                scope.selected.splice(indexInSelected(tag), 1);
                changed(tag);
            };

            scope.toggleTag = function (tag) {
                if (scope.isSelected(tag)) {
                    scope.closeTag(tag);
                } else {
                    scope.addTag(tag);
                }
            };

            scope.$watch('tags', function () {
                if (scope.tags === undefined) {
                    return;
                }

                scope.all = [].concat(scope.tags);
                // record if selected
                scope.stats = {};
                _.each(scope.all, function (tag) {
                    scope.stats[tag] = false;
                });
            });
        }
    };
});
