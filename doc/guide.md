### 使用说明

当需要使用自定义事件的时候可以使用该模块来实现，通过将 CustomEvent.Target 混入普通对象就可以使得普通对象和 DOM 节点一样也能触发，添加和删除事件了。

### 基本使用示例

```
KISSY.use(['event-custom', 'util'], function(S, CustomEvent, Util){
	function Dog(name){
        this.name = name;
    }
    Util.augment(Dog, CustomEvent.Target, {
        shout : function(){
            this.fire('shout',{
                content : 'I am hungry...'
            });
        }
    });
    var myDog = new Dog('cuteDog');
    myDog.on('shout', function(ev){
        alert(this.name + 'say that ' + ev.conent);
    });
    myDog.shout();
});
```