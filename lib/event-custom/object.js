/**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
var BaseEvent = require('modulex-event-base');
var util = require('modulex-util');

/**
 * Do not new by yourself.
 *
 * Custom event object.
 * @private
 * @class CustomEvent.Object
 * @param {Object} data data which will be mixed into custom event instance
 * @extends Event.Object
 */
function CustomEventObject(data) {
    CustomEventObject.superclass.constructor.call(this);
    util.mix(this, data);
    /**
     * source target of current event
     * @property  target
     * @type {CustomEvent.Target}
     */
    /**
     * current target which processes current event
     * @property currentTarget
     * @type {CustomEvent.Target}
     */
}

util.extend(CustomEventObject, BaseEvent.Object);

module.exports = CustomEventObject;