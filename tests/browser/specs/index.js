/**
 * custom bubble mechanism tc
 * @author yiminghe@gmail.com
 */

var util = require('util');
/*global CustomEvent:true*/
var CustomEvent = require('event-custom');
/*jshint quotmark:false*/
var EventTarget = CustomEvent.Target;
var CustomEventObject = CustomEvent.Object;
var FIRST = '1',
    SECOND = '2',
    SEP = '=';

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

    // note 219
    it('fire does not depend on custom event\'s type', function () {
        var haha = 0,
            haha2 = 0,
            obj = util.mix({}, EventTarget);

        obj.on('haha', function (ev) {
            haha++;
            ev.type = 'hah3';
            obj.fire('haha2', ev);
        });

        obj.on('haha2', function () {
            haha2++;
        });

        obj.fire('haha');

        expect(haha).to.be(1);
        expect(haha2).to.be(1);

    });

    it("can fire more than one", function () {

        var args = [];

        function Test() {
            this.on("test", function (e) {
                args.push(e.a);
            });
            this.on("test2", function (e) {
                args.push(e.a);
            });
        }

        util.augment(Test, EventTarget);

        var t = new Test();

        t.fire("test test2", {
            a: 1
        });

        expect(args).to.eql([1, 1]);

    });

    describe('bubble', function () {
        it("can bubble", function () {

            var ret = [], args = [];

            function Test() {
                this.on("test", function (e) {
                    ret.push(this.id);
                    args.push(e.a);
                    e.a++;
                });
            }

            util.augment(Test, EventTarget);

            var t = new Test();

            t.id = 1;

            var t2 = new Test();

            t2.id = 2;

            t2.addTarget(t);

            t2.fire("test", {
                a: 1
            });

            expect(ret).to.eql([2, 1]);
            expect(args).to.eql([1, 2]);

            ret = [];
            args = [];

            t2.removeTarget(t);

            t2.fire("test", {
                a: 1
            });

            expect(ret).to.eql([2]);
            expect(args).to.eql([1]);

        });

        it('can bubble default', function () {
            var a = util.mix({}, EventTarget),
                c = util.mix({}, EventTarget),
                b = util.mix({}, EventTarget);
            a.id = 'a';
            b.id = 'b';
            c.id = 'c';
            var ret = [];
            a.addTarget(b);
            b.addTarget(c);

            c.on('click', function (e) {
                ret.push(e.target.id);
                ret.push(e.type);
                ret.push(e.currentTarget.id);
            });

            a.fire('click');

            expect(ret).to.eql(['a', 'click', 'c']);

        });

        it("can stop bubble by stopPropagation()", function () {
            var ret = [];

            function Test() {

                this.on("test", function (e) {
                    ret.push(this.id);
                    e.stopPropagation();
                });
            }

            util.augment(Test, EventTarget);

            var t = new Test();

            t.id = 1;


            var t2 = new Test();

            t2.id = 2;

            t2.addTarget(t);

            t2.fire("test");

            expect(ret).to.eql([2]);
        });

        // deprecated!!
        it("can stop bubble by return false", function () {
            var ret = [];

            function Test() {
                this.on("test", function () {
                    ret.push(this.id);
                    return false;
                });
            }

            util.augment(Test, EventTarget);

            var t = new Test();

            t.id = 1;


            var t2 = new Test();

            t2.id = 2;

            t2.addTarget(t);

            t2.fire("test");

            expect(ret).to.eql([2]);
        });

        it("can bubble more than one level", function () {

            var r1 = util.mix({}, EventTarget);

            var r2 = util.mix({}, EventTarget);

            var r3 = util.mix({}, EventTarget);

            r2.addTarget(r1);
            r3.addTarget(r2);

            var ret = 0;

            r1.on('click', function () {
                ret = 1;
            });

            r3.fire('click');

            expect(ret).to.be(1);

        });

        it("can not bubble if middle level does not allow", function () {

            var r1 = util.mix({}, EventTarget);

            var r2 = util.mix({}, EventTarget);

            var r3 = util.mix({}, EventTarget);

            r2.addTarget(r1);
            r3.addTarget(r2);

            r2.publish('click', {
                bubbles: false
            });

            var ret = 0;

            r1.on('click', function () {
                ret = 1;
            });

            r3.fire('click');

            expect(ret).to.be(0);

        });
    });

    it('should no memory leak for custom event', function () {
        var eventTarget = util.mix({}, EventTarget);

        function noop() {
        }

        function noop2() {
        }

        function noop3() {
        }


        eventTarget.on('click', noop);
        eventTarget.on('click', noop2);
        eventTarget.on('click', noop3);
        eventTarget.on('keydown', noop);
        (function () {
            var customEventObservables = eventTarget.getEventListeners();

            var num = 0;
            for (var i in customEventObservables) {
                expect(util.inArray(i, ['click', 'keydown']))
                    .to.be(true);
                num++;
            }
            expect(num).to.be(2);
            var clickObserver = customEventObservables.click;
            expect(clickObserver.observers.length).to.be(3);
        })();

        eventTarget.detach('click', noop);

        (function () {
            var customEventObservables = eventTarget.getEventListeners();
            var num = 0;

            for (var i in customEventObservables) {
                expect(util.inArray(i, ['click', 'keydown']))
                    .to.be(true);
                num++;
            }

            expect(num).to.be(2);
            var clickObserver = customEventObservables.click;
            expect(clickObserver.observers.length).to.be(2);
        })();

        eventTarget.detach('click');

        (function () {
            var customEventObservables = eventTarget.getEventListeners();
            expect(customEventObservables.keydown.hasObserver()).to.be.ok();
            var clickObserver = customEventObservables.click;
            expect(clickObserver.hasObserver()).not.to.be.ok();
        })();

        eventTarget.detach();

        (function () {
            var customEventObservables = eventTarget.getEventListeners();
            for (var o in customEventObservables) {
                expect(customEventObservables[o].hasObserver()).not.to.be.ok();
            }
        })();
    });

    describe('fire', function () {
        it('get fire value', function (done) {
            var SPEED = '70 km/h', NAME = 'Lady Gogo', dog;

            function Dog(name) {
                this.name = name;
            }

            util.augment(Dog, EventTarget, {
                run: function () {
                    return this.fire('running', {speed: SPEED});
                }
            });

            dog = new Dog(NAME);

            dog.on('running', function (ev) {
                result.push(this.name);
                result.push(ev.speed);
                return this.name;
            });

            function rfalse() {
                result.push(FIRST);
                return false;
            }

            dog.on('running', rfalse);

            function f() {
                result.push(SECOND);
                return  SECOND;
            }

            dog.on('running', f);

            // let dog run
            var result = [];

            //有一个为 false 就是 false
            expect(dog.run()).to.be(false);
            async.series([
                waits(0),
                runs(function () {
                    expect(result.join(SEP)).to.eql([NAME, SPEED, FIRST, SECOND].join(SEP));
                }),
                // test detach
                runs(function () {
                    result = [];
                    dog.detach('running', rfalse);
                    dog.on('running', function () {
                    });
                    // 没有 false，就取最后的值, 除了 undefined
                    expect(dog.run()).to.be(SECOND);
                }),
                waits(0),
                runs(function () {
                    expect(result.join(SEP)).to.eql([NAME, SPEED, SECOND].join(SEP));
                })
            ], done);
        });

        it('can get defaultFn value as final value', function () {
            var o = util.mix({}, EventTarget);

            o.publish('t', {
                defaultFn: function () {
                    return 'x';
                }
            });

            o.on('t', function () {
                return 'y';
            });

            expect(o.fire('t')).to.be('x');
        });

        it('can fire EventObject instance', function () {
            var event = new CustomEventObject({
                type: 'xx'
            });
            var node = util.mix({}, EventTarget);
            var fired = 0;
            node.on('xx', function (e) {
                fired = 1;
                expect(e.target).to.be(node);
                e.preventDefault();
                expect(e).to.be(event);
            });
            node.fire(event);
            expect(fired).to.be(1);
            expect(event.isDefaultPrevented()).to.be(true);
        });

        it('will propagate', function () {
            var event = new CustomEventObject({
                type: 'xx'
            });
            var node = util.mix({}, EventTarget);
            var node2 = util.mix({}, EventTarget);
            node.addTarget(node2);
            var fired = 0;
            node2.on('xx', function () {
                fired = 1;
            });
            node.fire(event);
            expect(fired).to.be(1);
            expect(event.isPropagationStopped()).to.be(false);
        });

        it('can set EventObject instance', function () {
            var event = new CustomEventObject({
                type: 'xx'
            });
            var node = util.mix({}, EventTarget);
            var node2 = util.mix({}, EventTarget);
            node.addTarget(node2);
            event.isPropagationStopped = function () {
                return true;
            };
            var fired = 0;
            node2.on('xx', function () {
                fired = 1;
            });
            node.fire(event);
            expect(fired).to.be(0);
            expect(event.isPropagationStopped()).to.be(true);
        });

        describe("fire manually for event groups", function () {

            function Target() {

            }

            util.augment(Target, EventTarget);

            it("should works with one group simply", function () {

                var g = new Target(), ret = [];
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 只删去属于 two 组的 click handler
                g.detach("click.two");
                g.fire('click');
                runs(function () {
                    expect(ret).to.eql([]);
                });
            });

            it("should fire", function () {
                var g = new Target(), ret = [];
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                g.fire('click');
                expect(ret).to.eql([1, 2]);

            });

            it("should fire at specified groups 1", function () {
                var g = new Target(), ret = [];
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 触发第二组事件
                g.fire("click.two");
                expect(ret).to.eql([1, 2]);
            });

            it("should fire at specified groups 2", function () {
                var g = new Target(), ret = [];
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 触发第一组的事件
                g.fire("click.one");
                expect(ret).to.eql([1]);
            });

            it("should fire at specified groups 3", function () {
                var g = new Target(), ret = [];
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                g.on('click.one', function () {
                    ret.push(3);
                });
                // 触发同时属于 one 和 two 组的 handler
                g.fire("click.one.two");
                expect(ret).to.eql([1]);
            });

            it("should works with multiple events", function () {
                var g = new Target(), ret = [];
                g.on("click.one.two click.two", function (e) {
                    expect(e.type).to.be('click');
                    ret.push(1);
                });
                g.detach("click.two");
                g.fire('click');
                runs(function () {
                    expect(ret).to.eql([]);
                });
            });

            it("should works with multiple events when remove", function () {
                var g = new Target(), ret = [];
                g.on("click.one click.two", function (e) {
                    expect(e.type).to.be('click');
                    ret.push(1);
                });
                // 删除 two 组和 one 组 的 click handler
                g.detach("click.two click.one");
                g.fire('click');
                runs(function () {
                    expect(ret).to.eql([]);
                });
            });

            it("should works with multiple events and no type when remove", function () {
                var g = new Target(), ret = [];
                g.on("click.one click.two", function (e) {
                    expect(e.type).to.be('click');
                    ret.push(1);
                });
                // 删除所有事件的 two 组和 one 组
                g.detach(".two .one");
                g.fire('click');
                runs(function () {
                    expect(ret).to.eql([]);
                });
            });

            it("should works with multiple events and groups", function () {
                var g = new Target(), ret = [];
                g.on("click.one.two click.two", function (e) {
                    expect(e.type).to.be('click');
                    ret.push(1);
                });
                // 删除既属于 two 组又属于 one 组的所有事件的 handler
                g.detach(".two.one");
                g.fire('click');
                runs(function () {
                    expect(ret).to.eql([1]);
                });
            });

            it("should works multiple groups", function () {
                var g = new Target(), ret = [];
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });

                g.detach("click.one");
                g.fire('click');
                runs(function () {
                    expect(ret).to.eql([2]);
                });
            });
        });

        describe("defaultFn", function () {
            it('call parent defaultFn first', function () {
                var ret = [],
                    t = util.mix({
                        id: 't'
                    }, EventTarget);

                t.publish('click', {
                    defaultFn: function () {
                        ret.push(this.id);
                    }
                });

                var t2 = util.mix({
                    id: 't2'
                }, EventTarget);

                t2.publish('click', {
                    defaultFn: function () {
                        ret.push(this.id);
                    }
                });

                t2.addTarget(t);

                t2.fire('click');

                expect(ret).to.eql(['t', 't2']);
            });

            it('can disable parent defaultFn', function () {
                var ret = [],
                    t = util.mix({
                        id: 't'
                    }, EventTarget);

                t.publish('click', {
                    defaultFn: function () {
                        ret.push(this.id);
                    }
                });

                var t2 = util.mix({
                    id: 't2'
                }, EventTarget);

                t2.publish('click', {
                    defaultTargetOnly: true,
                    defaultFn: function () {
                        ret.push(this.id);
                    }
                });

                t2.addTarget(t);

                t2.fire('click');

                expect(ret).to.eql(['t2']);
            });

            it('support simple defaultFn', function () {
                var ret = [],
                    t = util.mix({}, EventTarget);

                t.publish('click', {
                    defaultFn: function (e) {
                        ret.push(e.dataX);
                    }
                });

                t.fire('click', {
                    dataX: 1
                });

                expect(ret).to.eql([1]);
            });

            it('support simple defaultFn with listeners', function () {
                var ret = [],
                    t = util.mix({}, EventTarget);

                t.publish('click', {
                    defaultFn: function () {
                        ret.push('1');
                    }
                });

                t.publish('clickWithDefault', {
                    defaultFn: function () {
                        ret.push('2');
                    }
                });

                t.on('click', function (e) {
                    ret.push('3:' + e.data);
                    e.preventDefault();
                });

                t.on('clickWithDefault', function (e) {
                    ret.push('4:' + e.data);

                });

                t.fire('click', {
                    data: 1
                });

                t.fire('clickWithDefault', {
                    data: 2
                });

                expect(ret).to.eql(['3:1', '4:2', '2']);
            });
        });
    });
});