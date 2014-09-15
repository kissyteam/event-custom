/**
 * @ignore
 * Observer for custom event
 * @author yiminghe@gmail.com
 */

var BaseEvent = require('modulex-event-base');
var util = require('modulex-util');

/**
 * Observer for custom event
 * @class CustomEvent.Observer
 * @extends Event.Observer
 * @private
 */
function CustomEventObserver() {
    CustomEventObserver.superclass.constructor.apply(this, arguments);
}

util.extend(CustomEventObserver, BaseEvent.Observer, {
    keys: ['fn', 'context', 'groups']
});

module.exports = CustomEventObserver;