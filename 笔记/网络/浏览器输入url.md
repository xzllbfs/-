# 从浏览器输入url引发的一系列面试题

**一个页面从输入 URL 到页面加载显示完成，这个过程中都发生了什么？**

1. 用户输入过程中，浏览器进行下拉联想，根据历史记录补全url，或者添加http协议头
2. 判断强缓存：是否存在未过期的缓存，如果存在直接渲染页面，否则发起网络请求
3. 网络请求阶段：
   1. DNS解析域名，读取缓存的ip地址，向服务端发起请求
   2. 建立TCP连接（3次握手）
   3. 浏览器发送get请求
   4. 服务端如果负载均衡的服务器，就会分发给具体的服务器
   5. 返回数据，浏览器根据状态码确认缓存方式(判断协商缓存)
      1. 304-读取缓存文件
      2. 200-覆盖or创建新的缓存文件
4. 如果文件是html，开始渲染页面
5. 页面渲染阶段：
   1. 处理HTML标记，通过HTML Parser+CSS Parser 构建 DOM Tree + CSSOM Tree
      1. Doctype：浏览器通过判断文档类型来决定用什么模式来解析，以及切换浏览器模式
      2. meta：用来定义的元信息：渲染模式，SEO相关信息
      3. title：显示页面标题
      4. link：通过href加载或解析外链资源，主要是css
      5. style：正常情况下，css不会阻塞DOM树渲染，除非有通过@import动态导入的样式才会阻塞
      6. script：正常情况下，js会阻塞页面渲染，除了外链的js添加defer属性
      7. img：不会阻塞DOM渲染，但是如果没有设置宽高，加载完成后会触发DOM回流
   2. 整合渲染树：DOM Tree + CSSOM Tree = Render Tree
   3. 布局=>回流/重排：根据渲染树，计算它们在设备视口内的确切位置和大小
   4. Painting：根据渲染树和回流得到的几何信息和节点的绝对像素绘制GUI
   5. display：将内容都呈现出来，展示给用户
6. 静置一段时间后，如果浏览器不再发起请求则关闭TCP连接（4次挥手）

## 缓存策略

1. 浏览器是如何缓存文件的？强缓存和协商缓存的区别是什么？
2. Cache-control属性的值有哪些？

## 网络请求

1. **如何解决跨域问题?**

   同源策略：两个url的协议，域名，端口三者必须一致，不如不一致访问的数据需要进行跨域处理。

   跨域：所有的跨域都必须经过server端允许和配合，未经允许的跨域实现，说明浏览器有漏洞

   1. JSONP：由于`<script>`可以无视同源策略，并且浏览器可以任意动态拼接数据返回，所以可以`<script>`的异步加载可以获得跨域的数据。
   2. CORS 跨域资源共享：生产环境，服务端设置http header
   3. 本地服务代理：利用服务器访问服务器没有跨域问题的原理，先向代理(同源)服务器发起请求，再由代理(同源)服务器请求外部服务器
   4. Websoket
   5. postMessage：A窗口通过postMessage发送数据，B窗口通过addEventListener('message')接收数据
   6. 两个iframe通信
      - document.domain：两个窗口可以共享同一个字段名
      - window.name：两个窗口可以共享同一个字段名
      - location.hash：利用window.onhashchange，监听两个iframe通信的数据

2. http常见的请求头和响应头字段有哪些？

   **请求头**

   1. 接收内容：Accept，Accept-Charset，Accept-Encoding，Accept-Language，Accept-Ranges
   2. 请求内容：User-Agent，Content-Type（MIME信息），Content-Length，Referer，Host，If-Range，Range
   3. 连接：Connection，Authorization
   4. 缓存：Cookie，Cache-Control，If-Modified-Since，If-Match，If-None-Match，If-Unmodified-Since

   **响应头**

   1. 接收内容：Accept-Ranges，Allow
   2. 发送内容：Content-Encoding，Content-Language，Content-Length，Content-Location，Content-Range，Content-Type
   3. 定向：Location，refresh
   4. 缓存：Cache-Control，Expires，ETag，Last-Modified，Set-Cookie

3. http响应码有哪些？分别代表什么意思？

   1. 100：接受，服务器收到请求，没有返回

   2. 200：响应成功相关

      1. 201：Created 已创建，成功请求并创建了新的资源
      2. 204：No Content无内容，用于删除、更新成功等
      3. 206：收到部分内容，当客户端通过使用range头字段进行文件分段下载时使用该状态码

   3. 300：资源发生变化，配合响应头location字段使用，浏览器自动处理

      1. 301：永久重定向
      2. 302：临时重定向
      3. 304 ：No Modified 命中协商缓存，资源未发生更改，告诉浏览器从缓存中读取文件

      重定向的作用：促进SEO优化，增加网页收集，有利于搜索引擎搜索

   4. 400：客户端错误，资源访问相关问题

      1. 401：要求身份认证
      2. 403：Forbidden 服务端理解但是拒绝请求，比如没有用户权限
      3. 404：服务器找不到资源
      4. 405：请求方式被禁止，除get和head之外的请求方式都可以被禁止
      5. 409：conflict 资源冲突，比如注册用户重名
      6. 422：请求参数错误

   5. 500：服务端错误

      1. 500：服务器错误
      2. 502：网关错误，服务器作为网关且从上游服务器获取到了一个无效的HTTP响应
      3. 504：网关超时，服务器作为网关且不能从上游服务器及时的得到响应返回给客户端

4. CDN的原理，什么是cdn的回源？

   原理：解决服务器负载过大，静态资源请求延迟这两个问题

   1. 负载：将资源文件放在专门的cdn服务器上的，源服务器只用来处理数据的响应
   2. 延迟：DNS原理就是将就近服务器的ip地址返回，而不是去请求远程服务器，所以静态资源放在这个就近服务器，再去请求就会提升响应速度

   回源：cdn服务器上的资源是有失效时间的，资源失效之后, 去源头服务器上拉去最新的静态资源，这个过程叫做回源。但是如果所有cdn服务器都是定时去源服务器上拉取资源，就会对服务器造成负载，所以会在cdn服务器和源服务器中间加一层L2缓存服务器，只有L2缓存服务器才定期回源源服务器，然后其他cdn去L2缓存服务器上拉取，这样既可以达到效果，又可以减少对源服务器的压力

5. RestfulAPI是什么？http的请求方式有哪些？

   RestfulAPI是一种新的API设计理论，方便不同的前端设备与后端进行通信。传统API是把每个url当做一个功能，RestfulAPI是把每个url当做一个资源，前后端可以通过RestfulAPI定义的请求方式规范来传输数据。

   **请求方式**

   1. GET：获取资源
   2. POST：发送资源
   3. PUT：更新全部资源
   4. Patch：更新部分资源
   5. DELETE：删除资源
   6. HEAD：用于获取报文首部，不返回报文主体
   7. OPTIONS：检查服务器的性能，获取服务器支持的http请求方式。是一种针对“跨域资源”的预检（Preflight）请求，用来判断实际发送的请求是否安全。

6. URI和URL的区别？

   **URI 是统一资源标识符，而 URL 是统一资源定位符。**每个 URL 都是 URI，但不一定每个 URI 都是 URL。这是因为 URI 还包括一个子类，即统一资源名称 (URN)，它命名资源但不指定如何定位资源。

7. 为什么说http协议是一个无状态的协议？

   HTTP协议**不**对请求和响应之间的通信状态进行保存，也就是说在 HTTP 这个 级别，协议对于发送过的请求或响应都不做持久化处理。虽然是无状态协议，但为了实现期望的保持状态功能，于是引入了 Cookie 技术。有了 Cookie 再用 HTTP 协议通信，就可以管 理状态了。


11. 为什么建立TCP连接是三次握手，而关闭TCP连接却是四次挥手呢？

    三次握手是为了证明浏览器和服务器彼此都有传送能力：第1,2次握手证明客户端的发送（SYN同步报文）和接收（ACK应答报文）能力，第3次握手证明服务端的发送和接收能力。

    四次挥手：因为关闭连接时，服务端B不能立刻关闭，如果突然关闭会导致进程崩掉，服务器异常。

    - 第1次挥手：浏览器A发送（FIN报文）关闭连接的请求
    - 第2次挥手：B回应确认收到（ACK报文）
    - 第3次挥手：B传送完毕发出传输释放的消息（FIN,ACK报文），等待A确认
    - 第4次挥手：A收到消息后，等待2MSL后，发送关闭消息

12. http协议各个版本之间的区别？

13. **XHR和fetch请求怎么取消？**

14. TCP和UDP有什么区别？

    TCP协议连接是可靠的，因为服务端会有ACK响应。但UDP是不可靠的，没有服务端响应，比如QQ的早期版本用的就是UDP协议，因为网络不好，节省硬件消耗成本

## HTML渲染

1. 浏览器的渲染过程？

   1. 处理HTML标记，通过HTML Parser 构建DOM Tree
   2. 处理CSS标记，通过 CSS Parser 构建 CSSOM Tree
   3. 整合渲染树：DOM Tree + CSSOM Tree = Render Tree
   4. 回流=>布局/重排：根据渲染树，计算它们在设备视口内的确切位置和大小
   5. Painting：根据渲染树和回流得到的几何信息和节点的绝对像素进行绘制
   6. display：将内容都呈现出来，展示给用户

2. 浏览器解析html标签的具体过程？

   html标签的解析过程是在GUI渲染线程中进行的。

   1. Doctype：浏览器通过判断文档类型来决定用什么模式来解析，以及切换浏览器模式
   2. Meta：用来定义的元信息：渲染模式，SEO相关信息
   3. title：显示页面标题
   4. Link：通过href加载或解析外链资源，主要是样式
   5. CSS
      - link外链式 ：不阻塞DOM 树渲染，开辟HTTP线程加载资源
      - style内嵌式：不阻塞DOM树渲染，先记录下来，等所有css资源加载成功后，按照顺序依次渲染生成CSSOM树
      - @import导入式：阻塞DOM树渲染，开辟HTTP线程加载资源，资源加载回来，才会继续渲染
   6. script
      - 内嵌式：阻塞DOM树渲染，立即执行js
      - 普通外链式：阻塞DOM树渲染，同时开辟HTTP线程加载资源，加载回来后立即执行js
      - async外链式：开辟HTTP线程加载资源，继续渲染Dom树，加载完成停止DOM渲染，先执行js（不考虑导入顺序，按照加载回来的先后顺序执行）
      - defer外链式：开辟HTTP线程加载资源，等待DOM树渲染完，按照js导入顺序依次执行js
   7. img：不会阻塞DOM渲染，开辟HTTP线程加载src，加载回来后如果没有设置宽高会触发回流

3. 什么回流Reflow？触发机制有哪些？

   DOM结构中各个元素都有自己的盒模型，需要浏览器根据样式计算结果将元素放置在它该出现的位置上，这个过程称之为回流。

   **触发机制**

   - 增删改元素时，导致重绘和回流
   - 移动DOM位置或添加动画时
   - 修改css样式时
   - 浏览器窗口缩放Resize时，滚动页面时
   - 修改网页的默认字体时

4. 什么重绘Repaint？触发机制有哪些？

   当各种盒子的位置、大小、颜色、字体等确定之后，浏览器按照各自的特性绘制后呈现在在页面上，这个过程叫重绘。

   **触发机制**

   - Dom改动
   - Css改动

   **回流必将引起重绘，而重绘不一定会引起回流**

5. 什么是Doctype，它的作用是什么？传统模式和严格模式的区别？

   DTD（document type definition，文档类型定义）是一系列的语法规则，用来定义XML或XHTML的文件类型。浏览器会使用它来判断文档类型，决定使用何种模式来解析，以及切换浏览器模式。

   DOCTYPE是用来声明文档类型定义规范的，一个主要的用途就是验证文件的合法性。如果不合法，浏览器解析会出错。

   **DTD（文档类型定义）定义了一些文档类型，DOCTYPE将类型告诉浏览器，浏览器根据它来决定用什么模式来解析，以及切换浏览器模式。**

   传统模式：包含所有HTML元素和属性，**不包括**展示性和弃用的元素

   严格模式：包含所有HTML元素和属性，**包括**展示性和弃用的元素（浏览器能正常解析）

6. meta标签的viewport对应的content有哪些属性？

   1.  width：设置 viewport 的宽度，正整数/字符串 device-width
   2.  height：设置 viewport 的高度，正整数/字符串 device-height
   3.  initial-scale：设置设备宽度与 viewport大小之间的缩放比例，0.0-10.0之间的正数
   4.  maximum-scale：设置最大缩放系数，0.0-10.0之间的正数
   5.  minimum-scale：设置最小缩放系数，0.0-10.0之间的正数
   6.  user-scalable：如果设置为 no 用户将不能缩放网页，默认为 yes，yes / no

7. 如何理解HTML语义化？

   HTML语义化可以增加代码可读性，有利于搜索引擎优化（SEO）

8. 哪些Html标签是块级元素，哪些是内联元素？

   - 块状元素指的是display:block/table 的元素，特点内容是可以**独占一行**。其中包括：div h1-h6 table ul ol p，pre
   - 内联元素指的是display:inline/inline-block的元素，特点是内容**依次连接直至浏览器的边缘换行**为止。其中包括：span img input button i figure