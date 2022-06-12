require('intersection-observer');

import Alpine from 'alpinejs'

window.Alpine = Alpine
Alpine.start()


window.LazyLoad = require("vanilla-lazyload");

window.lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy",
});