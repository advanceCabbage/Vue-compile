//期望的用法new Compile(el,vm)
class Compile {
    constructor(el, vm) {
        this.$el = document.querySelector(el)//获取到当前el元素
        this.$vm = vm;//将Vue对象挂载到$vm上
        if (this.$el) {//$el存在开始编译
            this.$fragment = this.nodeToFragment(this.$el);//将$el转换为片段,不直接操作dom元素,直接操作不利于性能优化
            this.compile(this.$fragment)//执行编译
            this.$el.appendChild(this.$fragment)//将this.$fragment追加到this.$el上
        }
        if (vm.$options.created) {
            vm.$options.created.call(this.$vm);//call绑定作用域,使用this.name 能直接访问到
        }
    }

    // 新建文档碎片 dom接口
    nodeToFragment(el) {
        const fragment = document.createDocumentFragment();//创建代码片段
        //将el中的元素搬家到fragment 中,目的是避免直接操作Dom
        let child;
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment;
    }

    //执行编译
    compile(el) {
        const childNodes = el.childNodes;//获取el中所有节点
        Array.from(childNodes).map(node => {
            //判断每个节点的类型
            if (this.isElement(node)) {
                console.log(`编译元素${node.nodeName}`)
                const nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(attr => {
                    const attrName = attr.name;
                    const exp = attr.value;
                    if (this.isDirective(attrName)) {
                        //k-text k-model
                        const dir = attrName.substring(2);
                        this[dir] && this[dir](node, this.$vm, exp)
                    }
                    if (this.isEvent(attrName)) {
                        const dir = attrName.substring(1) // @click
                        this.eventHandler(node, this.$vm, exp, dir)
                    }
                })

            } else if (this.isInterprolation(node)) {
                console.log(`编译文本${node.textContent}`)
                this.compileText(node)

            }

            //递归子节点
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }

    //元素类型
    isElement(node) {
        return node.nodeType === 1;
    }

    //指令类型
    isDirective(attr) {
        return attr.indexOf('k-') === 0
    }

    //事件类型
    isEvent(attr) {
        return attr.indexOf("@") === 0
    }

    //插值类型 并且为{{}}包裹的插值
    isInterprolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }

    //编译文本
    compileText(node) {
        this.update(node, this.$vm, RegExp.$1, 'text')
        //node.textContent  = this.$vm.$data[RegExp.$1];
    }

    //更新函数,添加依赖
    update(node, vm, exp, dar) {
        const updaterFn = this[dar + 'Updater'];
        updaterFn && updaterFn(node, vm[exp]);//第一次初始化
        new Watcher(vm, exp, function (vlaue) {//添加依赖
            updaterFn && updaterFn(node, vlaue)
        })
    }

    //更新text类型的属性
    textUpdater(node, value) {
        node.textContent = value;
    }

    //编译k-text 函数
    text(node, vm, exp) {
        this.update(node, vm, exp, 'text')
    }

    // 事件处理
    eventHandler(node, vm, exp, dir) {
        let fn = vm.$options.methods && vm.$options.methods[exp]
        if (dir && fn) {
            node.addEventListener(dir, fn.bind(vm), false)
        }
    }

    //双向绑定
    model(node, vm, exp) {
        //指定input的value属性
        this.update(node, vm, exp, 'model')
        //视图对模型的响应
        node.addEventListener('input', (e) => {
            vm[exp] = e.target.value
        })
    }

    //更新mode类型数据
    modelUpdater(node, value) {
        node.value = value
    }

    //k-html
    html(node, vm, exp) {
        this.update(node, vm, exp, 'html')
    }

    htmlUpdater(node, value) {
        node.innerHTML = value
    }
}