// depend on jquery, underscore, ui utils
angular.module('higis.hui.thumbGrid', ['higis.hui.config', 'higis.hui.utils']).directive('thumbGrid', function (Config) {
    'use strict';
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            partial: '=',
            grid: '='
        },
        link: function (scope, element) {
            var offset = 0;

            scope.current = { };
            scope.height = scope.grid.height;

            function scrollToItem(item, time) {
                element.parent().animate({scrollTop: item.element.offset().top - element.offset().top},
                    (time !== undefined ? time : 500));
            }

            scope.setCurrent = function (current) {
                // 1. close
                if (current.handler === undefined) {
                    if (scope.current.element) {
                        scope.current.handler.shrink();
                    }
                }
                else {
                    // 2. open && no opened
                    if (scope.current.handler === undefined) {
                        // simply expand then scroll to element
                        current.handler.expand();
                        scrollToItem(current);
                    }
                    // 3. open && same line opened
                    else if (scope.current.element.offset().top === current.element.offset().top) {
                        // shrink then expand, without transition, then scroll
                        current.handler.expand(true);
                        scope.current.handler.shrink(true);
                        scrollToItem(current);
                    }
                    // 4. open && different line opened
                    else {
                        // if the element to be expanded is below the element expanded, then -
                        if (current.element.offset().top > scope.current.element.offset().top) {
                            var old = scope.current.handler;
                            // scroll with 2 items expanded
                            scrollToItem(current);
                            // expand
                            current.handler.expand(false, function () {
                                // when the above steps end,
                                // instantly shrink the old item, and also scroll, these two actions will compensate
                                // with each other so the newly expanded item will move
                                old.shrink(true);
                                scrollToItem(current, 0);
                            });
                            // FOOTNOTE: Here the expanded item is not shrink first because the upward moving caused
                            // by shrink may issue a up then down scroll(which is not comfortable for eyes), given:
                            // 1. the item to be expanded is below its final position at first
                            // 2. the moving tries to place the item above its final position
                            // The trick is effective because it prevent these two things happen simultaneously, and
                            // is valid because the old item will be invisible after the scrolling, so it is unnoticeable
                            // that it was not shrink immediately
                        } else {
                            // if the element to be expanded is above the element, then simply shrink then expand then
                            // scroll, because they will not conflict with each other. The logic when below is not
                            // suitable because in this scene viewer may see two expanded items simultaneously
                            scope.current.handler.shrink();
                            current.handler.expand();
                            scrollToItem(current);
                        }
                    }
                }

                scope.current = current;
            };

            scope.$watch(scope.grid.selected, function () {
                if (scope.grid.selected() < 0) {
                    scope.setCurrent({});
                }
                scope.$broadcast('open', scope.grid.selected());
            });

            scope.contentReady = function () {
                var expander = $('>li .og-expander', element);
                offset = scope.height + parseInt(expander.css('marginTop'), 10) + parseInt(expander.css('marginBottom'), 10);
                scope.current = { };
                scope.grid.select(-1);
            };
        },
        templateUrl: Config.root + 'templates/thumb-grid.html'
    };
})
    .directive('thumbGridContent', function ($timeout, Utils) {
        'use strict';
        return {
            restrict: 'EA',
            link: function (scope, element) {
                var expander = $('.og-expander', element);
                var offset = scope.height + parseInt(expander.css('marginTop'), 10) + parseInt(expander.css('marginBottom'), 10);
                var marginBottom = parseInt(element.css('marginBottom'), 10);

                // TODO it is strange that the event is triggered in details page, think about injecting it here
                var selected = function () {
                };
                scope.onSelected = function (handler) {
                    selected = handler;
                };

                // I have thought about fill all items into parent scope, but it is
                // difficult to determine when to clear the the items after data reloads
                scope.$on('open', function (e, index) {
                    if (scope.$index === index) {
                        scope.setCurrent({ handler: handler, element: element });
                    }
                });

                scope.$watch('$last', function () {
                    if (scope.$last) {
                        scope.contentReady();
                    }
                });

                var handler = {
                    expand: function (instant, afterExpanded) {
                        element.addClass('og-expanded');
                        expander.addClass('expanded');

                        if (instant) {
                            Utils.withoutTransition(expander, function () {
                                expander.height(scope.height);
                            });

                            Utils.withoutTransition(element, function () {
                                element.css('marginBottom', marginBottom + offset);
                            });

                            scope.partialNow = scope.partial;
                        } else {
                            expander.on(Utils.transitionEnd(), function () {
                                if (afterExpanded) {
                                    afterExpanded();
                                }

                                // Here I use $timeout and 20ms delay to put the data loading to background, in order to
                                // reduce the possibility that the data loading work intercepts the re-rendering triggered
                                // by afterExpanded()
                                $timeout(function () {
                                    scope.partialNow = scope.partial;
                                }, 20);
                                expander.off(Utils.transitionEnd());
                            });

                            expander.height(scope.height);
                            element.css('marginBottom', marginBottom + offset);
                        }
                    },

                    shrink: function (instant) {
                        expander.removeClass('expanded');
                        element.removeClass('og-expanded');
                        if (instant) {
                            Utils.withoutTransition(expander, function () {
                                expander.height(0);
                            });

                            Utils.withoutTransition(element, function () {
                                element.css('marginBottom', marginBottom);
                            });

                        } else {
                            element.css('marginBottom', marginBottom);
                            expander.height(0);
                        }
                    }
                };

                scope.open = function () {
                };

                scope.thumbClick = function () {
                    scope.grid.select(scope.$index);
                };

                scope.close = function () {
                    scope.grid.ss
                }
            }
        };
    });
