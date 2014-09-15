/**
 * @ignore
 * custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */

var BaseEvent = require('modulex-event-base');
var CustomEventObservable = require('./observable');
var util = require('modulex-util');
var Utils = BaseEvent.Utils,
    splitAndRun = Utils.splitAndRun,
    KS_BUBBLE_TARGETS = '__~ks_bubble_targets';

/**
 * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
 * and also allows other EventTargets to target the object with events sourced from the other object.
 *
 * EventTarget is designed to be used with augment to allow events to be listened to and fired by name.
 *
 * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
 * or will not be created at all.
 *
 *
 *
 *      @example
 *      use('event/custom',function(S,CustomEvent){
     *          var target = mix({}, CustomEvent.Target);
     *          target.on('ok',function(){
     *              document.writeln('ok fired @'+new Date());
 *          });
 *          target.fire('ok');
 *      });
 *
 *
 * @class CustomEvent.Target
 */

var KS_CUSTOM_EVENTS = '__~ks_custom_events';

function getCustomEventObservable(self, type) {
    var customEvent = self.getEventListeners(type);
    if (!customEvent) {
        customEvent = self.getEventListeners()[type] = new CustomEventObservable({
            currentTarget: self,
            type: type
        });
    }
    return customEvent;
}

module.exports = {
    isTarget: 1,

    /**
     * Fire a custom event by name.
     * The callback functions will be executed from the context specified when the event was created,
     * and the {@link CustomEvent.Object} created will be mixed with eventData
     * @method fire
     * @param {String} type The type of the event
     * @param {Object} [eventData] The data will be mixed with {@link CustomEvent.Object} created
     * @return {*} If any listen returns false, then the returned value is false. else return the last listener's returned value
     */
    fire: function (type, eventData) {
        var self = this,
            ret,
            targets = self.getTargets(),
            hasTargets = targets && targets.length;

        if (type.isEventObject) {
            eventData = type;
            type = type.type;
        }

        eventData = eventData || {};

        splitAndRun(type, function (type) {

            var r2, customEventObservable;

            Utils.fillGroupsForEvent(type, eventData);

            type = eventData.type;

            // default bubble true
            // if bubble false, it must has customEvent structure set already
            customEventObservable = self.getEventListeners(type);

            // optimize performance for empty event listener
            if (!customEventObservable && !hasTargets) {
                return;
            }

            if (customEventObservable) {

                if (!customEventObservable.hasObserver() && !customEventObservable.defaultFn) {

                    if (customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles) {
                        return;
                    }

                }

            } else {
                // in case no publish custom event but we need bubble
                // because bubbles defaults to true!
                customEventObservable = new CustomEventObservable({
                    currentTarget: self,
                    type: type
                });
            }

            r2 = customEventObservable.fire(eventData);

            if (ret !== false && r2 !== undefined) {
                ret = r2;
            }

        });

        return ret;
    },

    /**
     * Creates a new custom event of the specified type
     * @method publish
     * @param {String} type The type of the event
     * @param {Object} cfg Config params
     * @param {Boolean} [cfg.bubbles=true] whether or not this event bubbles
     * @param {Function} [cfg.defaultFn] this event's default action
     * @chainable
     */
    publish: function (type, cfg) {
        var customEventObservable,
            self = this;

        splitAndRun(type, function (t) {
            customEventObservable = getCustomEventObservable(self, t);
            util.mix(customEventObservable, cfg);
        });

        return self;
    },

    /**
     * Registers another EventTarget as a bubble target.
     * @method addTarget
     * @param {CustomEvent.Target} anotherTarget Another EventTarget instance to add
     * @chainable
     */
    addTarget: function (anotherTarget) {
        var self = this,
            targets = self.getTargets();
        if (!util.inArray(anotherTarget, targets)) {
            targets.push(anotherTarget);
        }
        return self;
    },

    /**
     * Removes a bubble target
     * @method removeTarget
     * @param {CustomEvent.Target} anotherTarget Another EventTarget instance to remove
     * @chainable
     */
    removeTarget: function (anotherTarget) {
        var self = this,
            targets = self.getTargets(),
            index = util.indexOf(anotherTarget, targets);
        if (index !== -1) {
            targets.splice(index, 1);
        }
        return self;
    },

    /**
     * all targets where current target's events bubble to
     * @private
     * @return {CustomEvent.Target[]}
     */
    getTargets: function () {
        return this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = []);
    },

    getEventListeners: function (type) {
        var observables = this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {});
        return type ? observables[type] : observables;
    },

    /**
     * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
     * @method on
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] this object in callback
     * @chainable
     */
    on: function (type, fn, context) {
        var self = this;
        Utils.batchForType(function (type, fn, context) {
            var cfg = Utils.normalizeParam(type, fn, context);
            type = cfg.type;
            var customEvent = getCustomEventObservable(self, type);
            customEvent.on(cfg);
        }, 0, type, fn, context);
        return self; // chain
    },

    /**
     * Detach one or more listeners from the specified event
     * @method detach
     * @param {String} type The name of the event
     * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all observers will be removed.
     * @param {Object} [context] The custom object passed to subscribe.
     * @chainable
     */
    detach: function (type, fn, context) {
        var self = this;
        Utils.batchForType(function (type, fn, context) {
            var cfg = Utils.normalizeParam(type, fn, context);
            type = cfg.type;
            if (type) {
                var customEvent = self.getEventListeners(type);
                if (customEvent) {
                    customEvent.detach(cfg);
                }
            } else {
                util.each(self.getEventListeners(), function (customEvent) {
                    customEvent.detach(cfg);
                });
            }
        }, 0, type, fn, context);

        return self; // chain
    }
};

/*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 */