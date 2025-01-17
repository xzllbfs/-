# 前言

想想搬砖的这几年，踩坑最多的就是this，用一句古语来形容它就是：

> 诗如神龙，见其首不见其尾，或云中露一爪一鳞而已，安得全体？— 清·赵执信《谈龙录》

每次遇到this，都绕的我云里雾里，不知道其到底指向哪里。那么this到底指向谁呢？这不禁让我想到一个广为流传的说法：“谁调用它，this就指向谁”。这么说没有太大的问题，可是并不全面。想要全面了解this，我们还要回到 Javascript 中一个最基本的概念——执行上下文上面。

## 执行上下文

当一个函数被调用时，会创建一个执行上下文，执行上下文会包含函数的调用栈、调用方法以及传入的参数等信息。this就是记录的其中一个属性，会在函数执行的过程中用到。

### 执行上下文的定义

在 JavaScript 代码运行时，解释执行全局代码、调用函数等都会创建并进入一个新的执行环境，而这个执行环境被称之为执行上下文。

### 上下文与作用域

上下文、环境有时候也称作用域，即这两个概念有时候是混用的；不过，**上下文指代的是整体环境，作用域关注的是标识符（变量）的可访问性（可见性）**。上下文确定了，根据具体编程语言的作用域规则，作用域也就确定了。这就是上下文与作用域的关系。

### JavaScript 的执行

JavaScript代码的整个执行过程，分为两个阶段，代码编译阶段与代码执行阶段：

1. 预编译阶段：由编译器将 Javascript 编译成可执行的代码，此阶段会进行**变量**声明、并对变量声明进行**提升**，但是值为undefined、同时也会对所有非表达式的**函数声明**进行**提升**
2. 代码执行阶段：执行代码逻辑，执行上下文会在这阶段全部创建完成

![](https://user-gold-cdn.xitu.io/2019/8/20/16caf66df8f6026d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```js
foo(10)
function foo (num) {
  console.log(foo) // undefined
  foo = num
  console.log(foo) // 10
  var foo
}
console.log(foo) // function foo() {...}
foo = 1
console.log(foo) // 1
```

以上代码的执行过程分析如下：

**全局作用域**：

1. 预编译阶段：声明函数foo
2. 执行阶段1：调用foo(10)，进入foo函数**局部作用域**
   - 预编译阶段：声明局部变量foo（var foo）
   - 执行阶段1：第一个console，foo变量声明提升，输出undefined
   - 执行阶段2：将num(10)赋值给foo
   - 执行阶段3：第二个console，输出10
3. 执行阶段2：第三个console，输出函数foo
4. 执行阶段3：全局变量foo赋值为1，所以第四个console，输出1

根据以上的过程分析，可以得出的结论是，作用域在预编译阶段确定，但是作用域链是在执行上下文的创建阶段完全生成的，因为函数在调用时才会开始创建对应的执行上下文。

### 结构

执行上下文可以理解为一个抽象的对象，包括变量对象，作用域链及this指向，详细介绍如下所示：

| 参数                      | 值                                         | 描述                                                         |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Variable object：变量对象 | {vars, function declartions, arguments...} | 用于存储被定义在执行上下文中的变量和函数声明                 |
| Scope chain：作用域链     | [variable object + all parent scope]       | 一个对象列表，用以检索上下文代码中出现的标识符               |
| thisValue：上下文对象     | context object                             | 一个与执行上下文相关的特殊对象，也被称之为执行**上下文对象** |

执行上下文和作用域链相辅相成，但又不是一个概念。直观上看，执行上下文包含了作用域链，同时它们又像是一条河的上下游：**有了作用域链，才有执行上下文的一部分**。

代码执行的整个过程说起来就像一条生产流水线。第一道工序是在预编译阶段创建变量对象，此时**只是创建，并未进行赋值**。到了下一道工序代码执行阶段，**变量对象会转为活动对象**，即完成 Variable Object（简称VO）到 Active Object（简称AO）的转换。此时，**作用域链**也将被**确定**，它由当前执行环境的变量对象+所有外层已经完成激活的对象组成。这道工序保证了变量和函数的有序访问，即如果未在当前作用域中找到变量，则继续向上查找知道全局作用域。

这样的工序串成一个整体，就是 **JavaScript 引擎执行机制的基本原理**。

## 调用栈

在全局代码中调用函数，或函数中调用函数（如递归）等，都会涉及到在一个执行上下文中创建另一个新的执行上下文，并且等待这个新的上下文执行完毕，才会返回之前的执行上下文接着继续执行，而这样的调用方式就形成了**调用栈**。

代码如下：

```js
function foo1 () {
  foo2()
}
function foo2 () {
  foo3()
}
function foo3 () {
  foo4()
}
function foo4 () {
  console.log('foo4')
}
foo1()
```

以上代码中的调用关系为 foo1 → foo2 → foo3 → foo4。具体过程是：foo1先入栈，然后调用foo2，foo2入栈，以此类推，直到foo4执行完，然后foo4先出栈，foo3出栈，foo2出栈，最后foo1出栈。这个过程满足**先进后出（后进先出）**的规则，因此形成调用栈。

注意，正常来讲，在函数执行完毕并出栈时，函数内的局部变量在下一个垃圾回收（GC）节点被回收，该函数对应的执行上下文将会被销毁，这也正是我们在外界无法访问函数内定义的变量的原因。也就是说，只有函数执行时，相关函数才可以访问该变量，该**变量会在预编译阶段被创建，在执行阶段被激活，在函数执行完毕后，其上下文会被销毁**。

this实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数的调用位置。寻找调用位置的关键点在于分析调用栈，下面我们来看看到底什么是调用栈和调用位置：

```js
function baz () {
  // 当前调用栈是： baz
  // 调用位置：全局作用域

  console.log("baz")
  bar()
}

function bar () {
  // 当前调用栈是：baz -> bar
  // 调用位置：baz中

  foo()
  console.log('bar')
}

function foo () {
  // 当前调用栈是：baz -> bar -> foo
  // 调用位置：bar中
  
  console.log('foo')
}
baz()
```

我们可以使用浏览器的调试工具查看调用栈：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a048130ad3904f24943aa6073e200f82~tplv-k3u1fbpfcp-watermark.image)

## this

在分析this之前，还是照本宣科的摆出this的定义（[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)）：this的值为当前执行上下文（global、function 或 eval）的一个属性，在非严格模式下，总是指向一个对象，在严格模式下可以是任意值。

那么，`this`的值到底是什么呢？ 函数在不同使用场合，`this`有不同的值。总之，`this`就是函数运行时所在的环境对象，即上下文对象。

了解它的这些“天生特性”，才能够切实避免写出问题代码，也能使代码更具有可读性。下面上我们从一些实际场景中慢慢理解 this 的真谛吧！

### 1. 全局环境中的this

- 场景1：函数在全局作用域中

```js
function f1 () {
  console.log(this)
}

function f2 () {
  'use strict'
  console.log(this)
}

f1() // window
f2() // undefined
```

- 场景2：函数作为对象的方法。

```js
const foo = {
  bar: 10,
  fn: function () {
    console.log(this)
    console.log(this.bar)
  }
}
```

如果将对象中的函数赋值给了全局变量，this仍然指向window。以下代码中，虽然fn函数在foo对象中作为对象的方法，但是在赋值给fn1之后，fn1仍然是在window全局环境中执行的。

```js
var fn1 = foo.fn
fn1()

// window  => console.log(window)
// undefined => console.log(window.bar)
```

在执行函数时不考虑显示绑定，如果函数的this是被上一级的对象调用，那么this执行的就是上一级对象；否则指向全局环境。

```js
foo.fn()

// {bar: 10, fn: ƒ}
// 10
```

### 2. 上下文对象调用this

当存在复杂的调用关系时，比如以下代码中的嵌套关系，this会执行最后调用它的对象

```js
const foo = {
  bar: 10,
  self: function () {
    return this
  },
  obj: {
    name: 'sunshine',
		fn: function() {
			console.log(this.name)
		}
	}
}

foo.obj.fn()
console.log(foo.self() === foo)

// sunshine
// true
```

下面给出一组复杂场景案例：

```js
const o1 = {
  text: 'o1',
  fn: function() {
    return this.text
  }
}

const o2 = {
  text: 'o2',
  fn: function () {
    return o1.fn()
  }
}

const o3 = {
  text: 'o3',
  fn: function () {
    var fn = o1.fn
    return fn()
  }
}

console.log(o1.fn()) // o1
console.log(o2.fn()) // o1
console.log(o3.fn()) // undefined
```

1. 因为是o1调用的fn，所以o1.fn中的this等于o1，输出结果为o1
2. 因为o2中的fn返回的是o1.fn()调用后的结果，所以输出结果也是o1
3. o3中的o1.fn赋值给了var，调用o3的时候，var在全局环境中，这种情况叫"裸奔"调用。因此this指向window，运行结果为undefined

如果需要o2.fn()的输出结果为o2，在不使用bind等方法的前提下，可以做出如下改动：

```js
const o2 = {
  text: 'o2',
  fn: o1.fn
}

console.log(o2.fn()) // o2
```

将o1.fn函数本身赋值给o2.fn，那么调用o2的时候，this指向o2，输出结果自然就是o2了

### 3. 构造函数中的this

- 场景1：执行以下代码输出 undefined，此时 instance 返回的空对象 obj

```js
function Foo () {
  this.user = 'sunshine'
  const obj = {}
  return obj
}

const instance = new Foo()
console.log(instance.user) // undefined
```

结论：如果构造函数中显式返回一个值是一个对象（复杂数据类型），那么this就指向这个返回的对象；

- 场景2：执行以下代码输出 sunshine, 此时 instance 返回的是目标对象实例 this

```js
function Foo () {
  this.user = 'sunshine'
  return 1
}

const instance = new Foo()
console.log(instance.user) // sunshine
```

结论：如果构造函数中显式返回一个值不是一个对象（基本数据类型），那么this仍然指向实例。

那么，new操作符调用构造函数时具体做了哪些事情？下面简单模拟一下，更复杂的实现方式可以参考原型、原型链相关知识：

```js
function newFoo () {
  // 1. 创建一个空对象
  var obj = {}
  // 2. 将构造函数的this指向这个新的对象
  obj.__proto__ = Foo.prototype
  // 3. 为这个新的对象添加属性、方法等
  Foo.call(obj)
  // 4. 返回新对象
  return obj
}
```



### 4. 箭头函数中的this

箭头函数中，this指向是由其所属函数或全局作用域决定的。 this: the enclosing(function or global) scope

下面通过setTimeout方法来比较有无箭头函数的时候，this指向的区别：

- this 在匿名函数中，指向window对象

```js
const foo = {
  fn: function () {
    setTimeout(function () {
      console.log(this)
    }, 200)
  }
}
foo.fn() // window
```

- this在箭头函数中，指向 fn 本身

```js
const foo = {
  fn: function () {
    setTimeout((params) => {
      console.log(this)
    }, 200)
  }
}
foo.fn() // {fn: ƒ}
```

### 5. 改变this指向

如果想要强行改变 this 的指向，可以使用 `Function.prototype` 提供的 call，apply和 bind方法

关于三者之前的区别用一句话总结：**它们都是用来改变相关函数this指向的，但是call和apply是直接执行相关函数；bind不会执行相关函数，而是返回一个新的函数，这个新的函数已经自动绑定了新的this指向，开发者可以手动调用它；call和apply之间的区别主要体现在参数设定上。**

以下3段代码是等价的：

```js
const foo = {
  name: 'sunshine',
  logName: function (age, weight) {
    console.log(this.name, age, weight)
  }
}

const bar = {
  name: 'colorful'
}

foo.logName.call(bar, 32, 70)
foo.logName.apply(bar, [32, 70])
foo.logName.bind(bar, 32, 70)()
// colorful 32 70
```

这个例子中，我们使用call和apply方法，让 `foo.logName` 函数的 this 指向了 `bar `对象，所以输出的结果为 colorful 32 70。对于call,apply,bind的高级用法需要结合构造函数和组合来实现继承。

### 6. this优先级

我们通常把通过 call/apply/bind/new 对 this 进行绑定的情况称为**显式绑定**，而根据调用关系确定 this 指向的情况称为**隐式绑定**。关于他们的优先级有以下几种情况：

#### 显/隐式绑定

- 场景1：普通函数中的this，优先级：显式绑定 > 隐式绑定 > 默认绑定

```js
function foo () {
  console.log(this.a)
}

const obj1 = {
  a: 1,
  foo: foo
}

const obj2 = {
  a: 2,
  foo: foo
}
// 默认绑定
obj2.foo() // 2

// 显示绑定
foo.call(obj2) // 2

// 隐式绑定
obj2.foo.call(obj1) // 1 => obj2.foo === foo
```

由上述代码得出，无论调用 foo 的对象是谁，this 始终指向被call绑定的对象

#### new 绑定

- 场景2：new 绑定的优先级比 显式绑定的高

```js
function foo (a) {
  this.a = a
}

const obj1 = {}
var bar = foo.bind(obj1) // bar函数的this指向obj1
bar(2) // obj = { a: 2 }
console.log(obj1.a) // 2

var baz = new bar(3) // bar与obj1解绑
console.log(baz.a)
```

上述代码中，bind 将 foo 函数中的 this 绑定为 obj1 对象并赋值给bar，bar函数执行后，obj1对象为 {a:2}。

bar 函数本身是通过 bind 方法构造的函数，其内部已经将 this 绑定为 obj1，当它再次作为构造函数通过 new 调用时，返回的实例就已经与obj1解绑了。也就是说，new 绑定修改了bind绑定中的this指向，因此 new 绑定的优先级比显式 bind 绑定的更高。

#### 箭头函数绑定

简单来说，箭头函数放弃了所有普通 this 绑定的规则，取而代之的是用当前的 词法（静态）作用域 覆盖了this本来的值。**箭头函数的绑定无法被修改(new 也不行)**，箭头函数最常用于回调函数中, 如事件处理或者定时器。

- 场景3：箭头函数的this指向绑定无法被修改，第一次调用产生了闭包，内存没有被垃圾回收，所以指向不变

```js
function foo () {
  return a => {
    console.log(this.a)
  }
}

const obj1 = {
  a: 1,
  foo: foo
}

const obj2 = {
  a: 2,
  foo: foo
}

foo.call(obj1)() // 1
foo.call(obj2)() // 1
```

- 场景4：如果箭头函数中返回箭头函数，那么 this 指向 window。注意：如果将var改为const，则输出undefined，因为 const 声明的对象不会挂在到 window 对象上

```js
var a = 123 // const a = 123
const foo = () => a =>{
  console.log(this.a)
}

const obj1 = {
  a: 1,
  foo: foo
}

const obj2 = {
  a: 2,
  foo: foo
}

foo.call(obj1)() // 123
foo.call(obj2)() // 123
```

综上所述，this 绑定的优先级如下：**箭头函数 > new绑定 > 显示绑定 > 隐式绑定 >  默认绑定**

箭头函数优先级最高，会无视其它绑定规则。默认绑定优先级最低，只有其他绑定都不使用的时候，才会使用默认绑定。

### 小结

关于this的使用场景，总结以下几条规律，希望大家记住！

1. 在函数体中，非显示或隐式地简单调用函数时，在严格模式下，函数内的this会被绑定到`undefined`上，在非严格模式下则会被绑定到全局对象`window/global`上。
2. 一般通过上下文对象调用函数时，函数体内的this会被绑定到该对象上
3. 一般使用`new`方法调用构造函数时，构造函数内的this会被绑定到新创建的对象上
4. 在箭头函数中，`this`的指向是由外层（函数或全局）作用域来决定的
5. 一般通过 `call/apply/bind` 方法显式调用构造函数时，构造函数的 `this` 会被绑定到新创建的对象上

## 面试题

### Q1: 对象中的函数 this 指向

```js
var fullName = 'language'
var obj = {
  fullName: 'javascript',
  prop: {
    getFullName: function () {
      return this.fullName
    }
  }
}
console.log(obj.prop.getFullName())
var test = obj.prop.getFullName
console.log(test())
```

答案：`javascript` `language`，方法执行时`getFullName()` 由`obj.prop`调用，所以`this`为`obj.prop`，输出`javascript`，因为 `this` 会执行最后调用它的对象；`test()`在全局作用域中，由`window`调用，输出`window.fullName`即`language`；

### Q2: 综合案例

```js
var num = 10
var obj = { num: 20 }
obj.fn = (function (num) {
  this.num = num * 3
  num++
  return function (n) {
    this.num += n
    num++
    console.log(num)
  }
})(obj.num)
var fn = obj.fn
fn(5)
obj.fn(10)
console.log(num, obj.num)
```

答案：22 23 65 30

**全局作用域**：

1. 预编译阶段：创建变量`num` 和`obj`，初始值分别为`10`和 `{ num: 20 }`

2. 执行阶段1：obj.fn 赋值为一个自执行函数，进入自执行函数

   **自执行函数作用域**

   - 预编译阶段：创建形参变量 num，初始值为 obj.num (20)

   - 执行阶段1：**全局变量 num = 20*3 = 60**

   - 执行阶段2：**形参变量 num 自增1，为21**。

     因为21为基本数据类型，所以不会影响obj.num的值，故此时的obj.num仍然 为20，全局变量 num 为 60

3. 执行阶段2：将 obj.fn 赋值给 fn

4. 执行阶段3：执行fn(5)，此时触发了自执行函数作用域内部的回调函数执行。**注意：因为是全局调用fn，所以回调函数内部的 `this` 仍然指向`window`**

   **回调函数作用域**

   - 预编译阶段：创建形参变量 n，初始值为5
   - 执行阶段1：**全局变量 num = 60 + 5 = 65**。
   - 执行阶段2：**形参变量num再次自增1，结果为22**
   - 执行阶段3：console 输出形参变量num，22

5. 执行阶段4：调用 obj.fn(10)，再次触发了自执行函数作用域内部的回调函数执行。**注意：因为是obj调用fn，所以回调函数内部的`this`指向`obj`。**

   **回调函数作用域**

   - 预编译阶段：创建形参变量 n，初始值为10
   - 执行阶段1：**obj.num = 20 + 10 = 30**。
   - 执行阶段2：**形参变量num再次自增1，结果为23**
   - 执行阶段3：console 输出形参变量num，23

6. 执行阶段5：console 输出全局变量 num 为 65，obj.num 为 30



## 参考文献

- [深入理解JS：执行上下文中的this](https://www.cnblogs.com/forcheng/p/12960972.html)

- [什么是作用域和执行上下文](https://segmentfault.com/a/1190000009522006)

- [JavaScript中的this指向和易错前端面试题](https://juejin.cn/post/6847902220634046472#heading-4)

- 书籍：《前端开发核心知识进阶》之“一网打尽this，对执行上下文说Yes”

## 最后

文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。

想阅读更多优质文章、可我的微信公众号【阳姐讲前端】，每天推送高质量文章，我们一起交流成长。

## 最后

如果你觉得这篇内容对你有启发，我想请你帮个小忙：

1. 点击「**在看**」，让更多的人也能看到这篇内容

2. 关注公众号「**阳姐讲前端**」，持续为你推荐精选好文

3. 欢迎扫描下方二维码加我微信，拉你进群，长期交流学习....