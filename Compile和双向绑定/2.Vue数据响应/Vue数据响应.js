//期望的用法 new Kvue({...data})
class Kvue{
    constructor(options){
        //缓存data数据
        this.$data = options.data
        //观察data数据,便于更新data
        this.observe(this.$data)
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
        Object.defineProperty(obj,key,{
            get(){
                return val;
            },
            set(newValue){
                if(newValue === val){
                    return;
                }
                val = newValue;
                console.log(`${key}属性更新了`)
            }
        })
    }
}