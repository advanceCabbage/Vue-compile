//期望的用法 new Kvue({...data})
class Kvue{
    constructor(options){
        //缓存options 便于其他类使用
        this.$options = options
        this.$data = options.data
        //观察data数据,便于更新data
        this.observe(this.$data)
        //对watcher写一个测试代码
        new Watcher()
        this.$data.name;
        new Watcher()
        this.$data.list.age;
    }
    observe(data){
        //判断data是否为一个对象
        if(!data || typeof(data) !== 'object'){
            return;
        }
        //遍历该对象 为对象的每个key添加Object.defineProperty
        Object.keys(data).forEach(key=>{
            this.defineReactive(data,key,data[key])
        })
    }
    defineReactive(obj,key,val){
        this.observe(val);
        const dep = new Dep();//在函数作用域中每一个Dep都是相对独立的
        Object.defineProperty(obj,key,{
            get(){
                //对watcher写的测试代码,触发get的时候将变量添加到watcher中
                Dep.target && dep.addDep(Dep.target)
                return val;
            },
            set(newValue){
                if(newValue === val){
                    return;
                }
                val = newValue;
                //当属性更新的时候通知watcher做更新操作
                dep.notify()
                // console.log(`${key}属性更新了`)
            }
        })
    }
}
//实现一个Dep类用于订阅watcher -->Dep为订阅者
class Dep{
    constructor(){
        this.deps = []//用于管理所有的watcher
    }
    addDep(dep){//将watcher添加到Deps中管理
        this.deps.push(dep)
    }
    notify(){//通知所有的watcher去做更新,调用dep自身提供的update方法
        this.deps.forEach(dep=>dep.update())
    }
}
//实现一个Watcher类用于对所有data对象的监听  --->Watcher是观察者
class Watcher{
    constructor(){
        //将this作用域指向当前的Dep的静态属性target
        Dep.target = this
    }
    update(){//实现watcher的更新方法
        console.log("更新了")
    }
}