angular.module('higis.hui.contextCircle', []).directive('contextCircle', function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {},
        transclude: true,
        link: function (scope, element) {
            var space = 20;
            var alpha0_l = Math.PI / 12;
            var alpha0_r = Math.PI / 12;

            var getNumAttr = function (key, target) {
                if (!target) {
                    target = element;
                }
                return parseFloat(target.css(key), 10);
            };
            var button = function () {
                return element.children().first();
            };
            var items = function () {
                return element.children().last().children();
            };
            var initR = button().outerWidth() / 2;
            scope.expanded = false;

            var R00 = element.outerWidth() / 2;
            var R0 = R00 - space;
            var r = items().outerWidth() / 2;
            // here it is recorded separately because the r should be full width include padding and border
            var oldItemSize = items().width();
            var n = items().length;
            var oldMarginTop = getNumAttr('margin-top');
            var oldMarginLeft = getNumAttr('margin-left');

            var R = R0 - r;
            var beta = Math.asin(r / R);
            var delta = (Math.PI - alpha0_l - alpha0_r - 2 * beta) / (n - 1);
            var alpha = function (i) {
                return alpha0_l + beta + delta * i;
            };
            var pos = function (i) {
                var angle = alpha(i);
                return {
                    x: Math.cos(angle) * R,
                    y: Math.sin(angle) * R
                };
            };

            var shrink = function () {
                element.width(initR * 2);
                element.height(initR * 2);
                element.css('margin-top', oldMarginTop + R00 - initR);
                element.css('margin-left', oldMarginLeft + R00 - initR);
                element.removeClass('scope.expanded');

                button().css('top', 0);
                button().css('left', 0);

                items().addClass('min');
                items().css('margin-left', 0);
                items().css('left', initR - r);
                items().css('top', 0);
                scope.expanded = false;
            };

            var expand = function () {
                element.width(R00 * 2);
                element.height(R00 * 2);
                element.css('margin-top', oldMarginTop);
                element.css('margin-left', oldMarginLeft);
                element.addClass('scope.expanded');

                button().css('top', R00 - initR);
                button().css('left', R00 - initR);

                items().removeClass('min');
                items().css('margin-left', -r);
                items().width(oldItemSize);
                items().height(oldItemSize);
                for (var i = 0; i < items().length; i++) {
                    var newPos = pos(i);
                    items().eq(i).css('left', R00 - newPos.x);
                    items().eq(i).css('top', R00 + newPos.y - r);
                }

                scope.expanded = true;
            };

            shrink();

            scope.toggle = function () {
                scope.expanded ? shrink() : expand();
            };
        },
        template: '<div><div ng-class="{expanded:expanded, toggle:true}" ng-click="toggle()"><i ></i></div>' +
            '<div ng-transclude></div></div>'
    };
});