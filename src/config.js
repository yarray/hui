angular.module('higis.hui.config', [])
    .service('Config', function () {
        'use strict';
        var scripts = document.getElementsByTagName('script');
        var current = scripts[scripts.length - 1].src;
        return { root: current.substring(0, current.lastIndexOf('/')) + '/' };
    })

    .filter('locale', function () {
        'use strict';
        return function(rep) {
            // TODO add real locale filter
            return rep;
        };
    });