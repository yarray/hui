// depend on jquery
angular.module('higis.hui.utils', []).service('Utils', function () {
    'use strict';
    return {
        transitionEnd: function () {
            var t;
            var el = document.createElement('fakeElement');
            var transitions = {
                transition: 'transitionend',
                OTransition: 'oTransitionEnd',
                MozTransition: 'transitionend',
                WebkitTransition: 'webkitTransitionEnd'
            };

            for (t in transitions) {
                if (transitions.hasOwnProperty(t)) {
                    if (el.style[t] !== undefined) {
                        return transitions[t];
                    }
                }
            }

            return '';
        },
        onTransitionEnd: function (element, callback) {
            var event = this.transitionEnd();
            element.on(event, function (e) {
                if (e.target === element[0]) {
                    e.stopPropagation();
                    element.off(event);
                    callback(e);
                }
            });
        },
        withoutTransition: function (target, action) {
            target.addClass('no-trans');
            action();
            target.css('transition'); // tricky: let css reflow
            target.removeClass('no-trans');
            target.css('transition'); // tricky: let css reflow
        }
    };
});