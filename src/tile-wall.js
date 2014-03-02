// depend on jquery, underscore, ui utils
angular.module('higis.hui.tileWall', ['higis.hui.config', 'higis.hui.utils'])
    .factory('Tiles', function () {
        'use strict';
        return {
            create: function (tileSettings, tileMode, total, gutter, isReverse, beforeShown) {
                var tiles = {};

                function initTiles(tileSettings) {
                    _.each(tileSettings, function (setting, name) {
                        tiles[name] = _.extend((tiles[name] ? tiles[name] : {}), setting);
                    });
                }

                initTiles(tileSettings);

                var mode = tileMode;
                var reverse = isReverse;

                var positions = {};
                var positionsChanged = function () {
                };

                var onPositionsChanged = function (handler) {
                    positionsChanged = handler;
                };

                function calculate() {
                    _.each(positions, function (value, key) {
                        delete positions[key];
                    });
                    var locAttr = mode === 'vertical' ? 'top' : 'left';
                    var sizeAttr = mode === 'vertical' ? 'height' : 'width';

                    // calculate size attr
                    var activeCount = _.filter(tiles,function (tile) {
                        return tile.active;
                    }).length;
                    var space = total - (activeCount - 1) * gutter;
                    var average = space / activeCount;
                    var remainedSpace = space, remainedCount = activeCount;
                    _.each(tiles, function (tile, name) {
                        if (tile.active) {
                            if (tile[sizeAttr] <= average) {
                                // smaller tiles are set to real size
                                positions[name] = {};
                                positions[name][sizeAttr] = tile[sizeAttr];
                                remainedSpace -= tile[sizeAttr];
                                remainedCount -= 1;
                            } else {
                                // big tiles' size are to be calculated, since they will adjust sizes
                                positions[name] = {};
                            }
                        }
                    });

                    // calculate big tiles' size
                    if (remainedCount > 0) {
                        var sizeUnderPressure = remainedSpace / remainedCount;
                        _.each(positions, function (pos) {
                            if (!pos[sizeAttr]) {
                                pos[sizeAttr] = sizeUnderPressure;
                            }
                        });
                    }

                    var currentLoc;
                    // calculate loc attr
                    if (reverse) {
                        currentLoc = total;
                        var reverseKeys = _.keys(positions).reverse();
                        _.each(reverseKeys, function (key) {
                            var pos = positions[key];
                            if (!pos[locAttr]) {
                                currentLoc -= pos[sizeAttr];
                                pos[locAttr] = currentLoc;
                                currentLoc -= gutter;
                            }
                        });
                    } else {
                        currentLoc = 0;
                        _.each(positions, function (pos) {
                            if (!pos[locAttr]) {
                                pos[locAttr] = currentLoc;
                                currentLoc += (pos[sizeAttr] + gutter);
                            }
                        });
                    }

                    positionsChanged(positions);
                    return positions;
                }

                function getMode() {
                    return mode;
                }

                function setMode(tileMode, isReverse, tileSettings) {
                    mode = tileMode;
                    reverse = isReverse;
                    if (tileSettings) {
                        initTiles(tileSettings);
                    }
                    return calculate();
                }

                function activate(name, insert) {
                    if (!insert) {
                        _.each(tiles, function (tile) {
                            tile.active = false;
                        });
                    }
                    tiles[name].active = true;
                    if (beforeShown) {
                        beforeShown(name);
                    }
                    return calculate();
                }

                function inactivate(name) {
                    tiles[name].active = false;
                    return calculate();
                }

                function inactivateAll() {
                    _.each(tiles, function (tile) {
                        tile.active = false;
                    });
                    return calculate();
                }

                function toggle(name, insert) {
                    if (tiles[name].active) {
                        return inactivate(name);
                    }
                    return activate(name, insert);
                }

                return {
                    activate: activate,
                    inactivate: inactivate,
                    inactivateAll: inactivateAll,
                    toggle: toggle,
                    setMode: setMode,
                    getMode: getMode,
                    onPositionsChanged: onPositionsChanged,
                    getPositions: function () {
                        return positions;
                    },
                    getTiles: function () {
                        return tiles;
                    }
                };
            }
        };
    })
    .directive('tileWall', function (Tiles, Config, Utils) {
        'use strict';
        return {
            restrict: 'A',
            replace: true,
            scope: {
                tiles: '=',
                tileWalls: '=',
                afterShown: '=',
                beforeShown: '='
            },
            transclude: true,
            templateUrl: Config.root + 'templates/tile-wall.html',
            link: function (scope, element) {
                var toPercents = function (setting) {
                    var res = {};
                    _.each(setting, function (value, key) {
                        res[key] = value + '%';
                    });
                    return res;
                };

                var wall = $('.wall', element);

                function buildComponents() {
                    var res = {};

                    _.each(wall.children(), function (tile) {
                        tile = $(tile);
                        var style = tile.attr('style');
                        res[tile.attr('name')] = { tile: tile, style: style ? style : '', title: tile.attr('title')};
                        tile.removeAttr("title");
                    });

                    return res;
                }

                function attachButtons(components) {
                    _.each($('.tile-bar', element).children(), function (button) {
                        components[$(button).attr('name')].button = $(button);
                    });
                }

                var relLeft = function (value) {
                    return (value - wall.offset().left) * 100.0 / wall.outerWidth();
                };

                var relTop = function (value) {
                    return (value - wall.offset().top) * 100.0 / wall.outerHeight();
                };

                var relLength = function (key, value) {
                    return value * 100.0 / wall[key]();
                };

                var components = buildComponents();
//                scope.names = _.keys(components);
                scope.names = [];
                _.each(components, function (v, k) {
                    scope.tileWalls[k] = _.extend({
                        name: k,
                        title: v.title,
                        show: true
                    }, scope.tileWalls[k]);
                    scope.names.push(scope.tileWalls[k]);
                });

                scope.$on('ready', function (e) {
                    e.stopPropagation();
                    attachButtons(components);

                    var tileOrigins = {};
                    var tileSettings = {};

                    function layout(positions, immediately) {
                        var settings = {};
                        var minimize = {};
                        // if position is set, then create expanded box for further adjust, else keep at origin point
                        _.each(components, function (comp, name) {
                            if (!(name in positions)) {
                                settings[name] = _.extend({}, tileOrigins[name]);
                                minimize[name] = true;
                            } else {
                                settings[name] = _.extend({}, tileSettings[name]);
                                minimize[name] = false;
                            }
                        });

                        _.each(positions, function (pos, name) {
                            _.extend(settings[name], pos);
                        });

                        _.each(components, function (comp, name) {
                            if (immediately) {
                                Utils.withoutTransition(comp.tile, function () {
                                    comp.tile.css(toPercents(settings[name]));
                                });
                            } else {
                                if (minimize[name]) {
//                                    comp.tile.off(ui.transitionEnd());
                                    comp.tile.addClass('min');
                                } else {
                                    Utils.onTransitionEnd(comp.tile, function () {
                                        comp.tile.removeClass('min');
                                        scope.afterShown(name);
                                        scope.$apply();
                                    });
                                }
                                comp.tile.css(toPercents(settings[name]));
                            }
                        });
                    }

                    function init() {
                        tileOrigins = {};
                        tileSettings = {};
                        _.each(components, function (comp) {
                            Utils.withoutTransition(comp.tile, function () {
                                comp.tile.attr('style', comp.style);
                                comp.tile.addClass('min');
                            });
                        });
                        _.each(components, function (comp, name) {
                            tileSettings[name] = {
                                left: relLeft(comp.tile.offset().left),
                                top: relTop(comp.tile.offset().top),
                                width: relLength('outerWidth', comp.tile.outerWidth()),
                                height: relLength('outerHeight', comp.tile.outerHeight())
                            };

                            tileOrigins[name] = {
                                left: relLeft(comp.button.offset().left + comp.button.outerWidth() / 2),
                                top: relTop(comp.button.offset().top + comp.button.outerHeight() / 2),
                                width: 0,
                                height: 0
                            };
                        });

                        // add close button
                        _.each(components, function (comp, name) {
                            $('<div class="close-button"></div>')
                                .prependTo(comp.tile).click(function () {
                                    scope.tiles.inactivate(name);
                                    scope.$apply();
                                });
                        });
                        layout({}, true);
                    }

                    init();

                    scope.tiles = Tiles.create(tileSettings, 'vertical', 100, 1.5, false, scope.beforeShown);
                    scope.tiles.onPositionsChanged(function (positions) {
                        if (!scope.minimized) {
                            layout(positions);
                        }
                    }, true);

                    scope.minimized = false;

                    function insertMode(insert) {
                        if (scope.minimized) {
                            scope.minimized = false;
                            scope.tiles.inactivateAll();
                            return false;
                        }
                        return insert;
                    }

                    scope.activateTile = function (name, insert) {
                        // if scope.minimized, ignore previous status, and reset minimized flag
                        scope.tiles.activate(name, insertMode(insert));
                    };

                    scope.toggleTile = function (name, insert) {
                        scope.tiles.toggle(name, insertMode(insert));
                    };

                    scope.rotating = false;
                    scope.rotate = function () {
                        if (scope.rotating) {
                            return;
                        }
                        scope.rotating = true;
                        var target = $('.sidebar', element);
                        if (scope.tiles.getMode() === 'vertical') {
                            layout({});
                            target.addClass('trans');
                            Utils.onTransitionEnd(target, function () {
                                Utils.withoutTransition(target, function () {
                                    element.addClass('horizon');
                                });

                                Utils.onTransitionEnd(target, function () {
                                    init();
                                    scope.tiles.setMode('horizon', true, tileSettings);
                                    scope.rotating = false;
                                });

                                target.removeClass('trans');
                            });
                        } else {
                            layout({});
                            target.addClass('trans');
                            Utils.onTransitionEnd(target, function () {

                                Utils.withoutTransition(target, function () {
                                    element.removeClass('horizon');
                                });

                                Utils.onTransitionEnd(target, function () {
                                    init();
                                    scope.tiles.setMode('vertical', false, tileSettings);
                                    scope.rotating = false;
                                });
                                target.removeClass('trans');
                            });
                        }
                    };

                    scope.toggleMinimizeAll = function () {
                        if (scope.minimized) {
                            layout(scope.tiles.getPositions());
                        } else {
                            layout({});
                        }
                        scope.minimized = !scope.minimized;
                    };

                    scope.linkClass = function (name) {
                        return name + (scope.tiles.getTiles()[name].active ? ' active' : '');
                    };

                    scope.tiles.init = init;
                    scope.tiles.rotate = scope.rotate;
                    scope.tiles.toggleMinimizeAll = scope.toggleMinimizeAll;
                });
            }
        };
    })
    .directive('tileButton', function () {
        'use strict';
        return {
            restrict: 'A',
            link: function (scope) {
                scope.$watch('$last', function () {
                    if (scope.$last) {
                        scope.$emit('ready');
                    }
                });
            }
        };
    });
