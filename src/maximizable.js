angular.module('higis.hui.maximizable', ['higis.hui.utils']).directive('maximizable', function (Utils) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element) {
            var top, bottom, left, right, bodyScrollX, bodyScrollY;
            scope.isMax = false;
            scope.maximize = function (afterExpanded) {
                // disable body scroll
                bodyScrollX = $(document.body).css('overflow-x');
                bodyScrollY = $(document.body).css('overflow-y');
                $(document.body).css('overflow-x', 'hidden');
                $(document.body).css('overflow-y', 'hidden');
                $(document.body).css('margin-right', $(document.body).css('margin-right') + 20);

                top = element.offset().top - window.pageYOffset;
                bottom = top + element.outerHeight();
                left = element.offset().left - window.pageXOffset;
                right = left + element.outerWidth();

                Utils.withoutTransition(element, function () {
                    element.css('position', 'fixed');
                    element.css('top', top);
                    element.css('bottom', $(window).height() - bottom);
                    element.css('left', left);
                    element.css('right', $(window).width() - right);
                });

                Utils.onTransitionEnd(element, function () {
                    scope.isMax = true;
                    if (afterExpanded) {
                        afterExpanded();
                    }
                    scope.$apply();
                });
                element.removeAttr('style');
                element.addClass('max');
            };

            scope.exitMax = function (afterShrink) {
                element.css('top', top);
                element.css('bottom', $(window).height() - bottom);
                element.css('left', left);
                element.css('right', $(window).width() - right);

                Utils.onTransitionEnd(element, function () {
                    Utils.withoutTransition(element, function () {
                        element.removeClass('max');
                        element.removeAttr('style');
                    });
                    scope.isMax = false;
                    if (afterShrink) {
                        afterShrink();
                    }
                    $(document.body).css('overflow-x', bodyScrollX);
                    $(document.body).css('overflow-y', bodyScrollY);
                    scope.$apply();
                });
            };
        }
    };
});