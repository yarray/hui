angular.module('higis.hui.config', []).service('Config', function () {
    'use strict';
    var scripts = document.getElementsByTagName('script');
    var current = scripts[scripts.length - 1].src;
    return { root: current.substring(0, current.lastIndexOf('/')) + '/' };
});