var util = require('modulex-util');
/*global CustomEvent:true*/
var CustomEvent = require('../../../');
/*jshint quotmark:false*/
var EventTarget = CustomEvent.Target;
var expect = require('expect.js');

describe("custom_event", function () {
    it("works for any object", function () {
        var r = 0;
        var x = util.mix({
            item: 1,
            length: 10
        }, EventTarget);

        x.on("my", function () {
            r = 1;
        });
        x.fire("my");
        expect(r).to.be(1);
    });

    it('support once', function () {
        var ret = [],
            t = util.mix({}, EventTarget);

        t.on('click', {
            once: 1,
            fn: function () {
                ret.push(1);
            }
        });

        t.on('click', {
            once: 1,
            fn: function () {
                ret.push(2);
            }
        });

        t.fire('click');
        t.fire('click');

        expect(ret).to.eql([1, 2]);

        expect(t.getEventListeners('click').hasObserver())
            .not.to.be.ok();
    });
});