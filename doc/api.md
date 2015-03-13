### on(eventType, fn, [scope])

- eventType {String} 自定义事件名称.包含一个或多个事件名称的字符串, 多个事件名以空格分开。 事件可以通过加点来表示分组，例如 "click.one" , "click.two
- fn {Function} 当事件触发时的回调函数
- [scope] {Object} 可选，作用域。回调函数的 this 值. 如果不指定默认为绑定事件的当前元素

为相应事件添加事件处理器

### addTarget(target)

- target {Object} 事件往上冒泡的事件源

添加冒泡事件源对象

```
KISSY.use(['util', 'event-custom'], function(S, Util, CustomEvent) {
    function Custom(id){
        this.id = id;
    }
    Util.augment(Custom, CustomEvent.Target);
    var c1 = new Custom("c1");
    var c2 = new Custom("c1");
    c1.addTarget(c2);
    c2.on("run",function(e){
        S.log(e.target.id +" fires event run"); // => c1 fires event run
    });
    c1.fire("run");
});
```

[添加冒泡事件源 demo](http://runjs.cn/code/bzppt8kc)
### removeTarget(target)

- target {Object} 事件往上冒泡的事件源

### detach(eventType, fn, [scope])

- eventType {String} 自定义事件名称
- fn {Function} 当事件触发时的回调函数
- [scope] {Object} 可选，作用域。回调函数的 this 值. 如果不指定默认为绑定事件的当前元素

解除绑定的事件处理器

### publish(eventType, cfg)

- eventType {String} 自定义事件名称

- cfg {Object} 事件的具体配置对象
  
  - [bubbles=true] {Boolean} 可选，是否支持冒泡，默认为true
  - [defaultFn] {Function}  默认动作函数，事件被触发时会默认执行，除非被事件对象通过preventDefault停止了
  
注册一个自定义事件，并配置该事件的特性，如是否能冒泡，及事件发生的默认动作函数，类似a标签的默认跳转动作

[创建自定义事件publish demo](http://runjs.cn/code/0h2ugbej)

### fire(eventType, eventData)

- eventType {String} 自定义事件名称
- eventData {Object} 要混入触发事件对象的数据对象

如果其中一个事件处理器返回 false , 则返回 false, 否则返回最后一个事件处理器的返回值