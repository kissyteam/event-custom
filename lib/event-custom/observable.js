/**
 * @ignore
 * custom event mechanism for
 * refer: http://www.w3.org/TR/domcore/#interface-customevent
 * @author yiminghe@gmail.com
 */

var BaseEvent = require('modulex-event-base');
var CustomEventObserver = require('./observer');
var CustomEventObject = require('./object');
var Utils = BaseEvent.Utils;
var util = require('modulex-util');

/**
 * custom event for registering and un-registering observer for specified event on normal object.
 * @class CustomEvent.CustomEventObservable
 * @extends Event.Observable
 * @private
 */
function CustomEventObservable() {
    var self = this;
    CustomEventObservable.superclass.constructor.apply(self, arguments);
    self.defaultFn = null;
    self.defaultTargetOnly = false;

    /**
     * whether this event can bubble.
     * Defaults to: true
     * @cfg {Boolean} bubbles
     */
    self.bubbles = true;
    /**
     * event target which binds current custom event
     * @cfg {CustomEvent.Target} currentTarget
     */
}

util.extend(CustomEventObservable, BaseEvent.Observable, {
    /**
     * add a observer to custom event's observers
     * @param {Object} cfg {@link CustomEvent.Observer} 's config
     */
    on: function (cfg) {
        var observer = /**@ignore
         @type CustomEvent.Observer*/new CustomEventObserver(cfg);
        if (this.findObserver(observer) === -1) {
            this.observers.push(observer);
        }
    },

    /**
     * notify current custom event 's observers and then bubble up if this event can bubble.
     * @param {CustomEvent.Object} eventData
     * @return {*} return false if one of custom event 's observers (include bubbled) else
     * return last value of custom event 's observers (include bubbled) 's return value.
     */
    fire: function (eventData) {
        eventData = eventData || {};

        var self = this,
            bubbles = self.bubbles,
            currentTarget = self.currentTarget,
            parents,
            parentsLen,
            type = self.type,
            defaultFn = self.defaultFn,
            i,
            customEventObject = eventData,
            gRet, ret;

        eventData.type = type;

        if (!customEventObject.isEventObject) {
            customEventObject = new CustomEventObject(customEventObject);
        }

        customEventObject.target = customEventObject.target || currentTarget;
        customEventObject.currentTarget = currentTarget;

        ret = self.notify(customEventObject);

        if (gRet !== false && ret !== undefined) {
            gRet = ret;
        }

        // gRet === false prevent
        if (bubbles && !customEventObject.isPropagationStopped()) {
            parents = currentTarget.getTargets();

            parentsLen = parents && parents.length || 0;

            for (i = 0; i < parentsLen && !customEventObject.isPropagationStopped(); i++) {
                ret = parents[i].fire(type, customEventObject);

                // false 优先返回
                if (gRet !== false && ret !== undefined) {
                    gRet = ret;
                }
            }
        }

        // bubble first
        // parent defaultFn first
        // child defaultFn last
        if (defaultFn && !customEventObject.isDefaultPrevented()) {
            var target = customEventObject.target,
                lowestCustomEventObservable = target.getEventListeners(customEventObject.type);
            if ((!self.defaultTargetOnly &&
                // defaults to false
                (!lowestCustomEventObservable || !lowestCustomEventObservable.defaultTargetOnly)) ||
                currentTarget === target) {
                // default value as final value if possible
                gRet = defaultFn.call(currentTarget, customEventObject);
            }
        }

        return gRet;

    },

    /**
     * notify current event 's observers
     * @param {CustomEvent.Object} event
     * @return {*} return false if one of custom event 's observers  else
     * return last value of custom event 's observers 's return value.
     */
    notify: function (event) {
        // duplicate,in case detach itself in one observer
        var observers = [].concat(this.observers),
            ret,
            gRet,
            len = observers.length,
            i;

        for (i = 0; i < len && !event.isImmediatePropagationStopped(); i++) {
            ret = observers[i].notify(event, this);
            if (gRet !== false && ret !== undefined) {
                gRet = ret;
            }
        }

        return gRet;
    },

    /**
     * remove some observers from current event 's observers by observer config param
     * @param {Object} cfg {@link CustomEvent.Observer} 's config
     */
    detach: function (cfg) {
        var groupsRe,
            self = this,
            fn = cfg.fn,
            context = cfg.context,
            currentTarget = self.currentTarget,
            observers = self.observers,
            groups = cfg.groups;

        if (!observers.length) {
            return;
        }

        if (groups) {
            groupsRe = Utils.getGroupsRe(groups);
        }

        var i, j, t, observer, observerContext, len = observers.length;

        // 移除 fn
        if (fn || groupsRe) {
            context = context || currentTarget;

            for (i = 0, j = 0, t = []; i < len; ++i) {
                observer = observers[i];
                var observerConfig = observer.config;
                observerContext = observerConfig.context || currentTarget;
                if (
                    (context !== observerContext) ||
                    // 指定了函数，函数不相等，保留
                    (fn && fn !== observerConfig.fn) ||
                    // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                    (groupsRe && !observerConfig.groups.match(groupsRe))
                    ) {
                    t[j++] = observer;
                }
            }

            self.observers = t;
        } else {
            // 全部删除
            self.reset();
        }

        // does not need to clear memory if customEvent has no observer
        // customEvent has defaultFn .....!
        // self.checkMemory();
    }
});

module.exports = CustomEventObservable;
/**
 * @ignore
 * 2012-10-26 yiminghe@gmail.com
 *  - custom event can bubble by default!
 */