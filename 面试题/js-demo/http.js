/**
* 模拟ajax请求
*/
function ajax (url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'json'
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(
          JSON.parse(xhr.responseText)
        )
      } else {
        reject(new Error(xhr.statusText))
      }
    }
    xhr.send()
  })
}

/**
 * 模拟jsonp
 * 1. 创建script标签
 * 2. 创建callback方法：将回调函数挂载在window上，回调函数执行后移除script标签
 * 4. 后台接受到请求，解析前端传过去的 callback 方法，返回该方法的调用，并且数据作为参数传入该方法
 * 5. 前端执行服务端返回的方法调用
 */
function jsonp({ url, params, callback }) {
  return new Promise((resolve, rerject) => {
    let script = document.createElement('script')
    window[callback] = function (data) {
      resolve(data)
      document.body.removeChild('script')
    }
    params = {...params, callback}
    let arr = new Array()
    for (let key in params) {
      arr.push(`${key}=${params[key]}`)
    }
    script.src = `${url}?${arr.join('&')}`
    document.body.appendChild('script')
  })
}

/** 测试
function show(data) {
  console.log(data)
}

jsonp({
  url: 'http://localhost:3000/show',
  params: {
    a: 1,
    b: 2
  },
  callback: 'show'
}).then(data => {
  console.log(data)
})
 */

