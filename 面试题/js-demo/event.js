/**
 * 事件委托
 * 1. 目标选择器可能存在（需要委托）或者不存在（不需要委托）
 * 2. 当点击的元素是目标元素的子元素，就继续查找找父级，
 * 3. 如果找到目标元素，执行事件委托
 * 4. 如果找不到，即找到了委托元素，则不执行委托
 * 缺点：不支持多个样式名
 */
function eventDelegate(element, eventType, selector, fn) {
  if (fn == null) {
    fn = selector
    selector = null
  }
  element.addEventListener(eventType, event => {
      let target = event.target
      if (selector) {
        while (!target.matches(selector)) {
            if (element === target) {
                target = null
                break
            }
            target = target.parentNode
        }
        target && fn.call(target, event)
      } else {
        fn(event)
      }
  })
  return element
}
// eventDelegate(ul, 'click', 'li', function(e, el) {
//   console.log(`点击了${this}标签`)
// })