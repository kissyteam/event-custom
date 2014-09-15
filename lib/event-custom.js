/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
var Target = require('./event-custom/target');
var util = require('modulex-util');
module.exports = {
    version: '@VERSION@',
    Target: Target,
    Object: require('./event-custom/object'),
    /**
     * global event target
     * @property {CustomEvent.Target} global
     */
    global: util.mix({}, Target)
};