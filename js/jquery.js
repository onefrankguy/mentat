;(function () {
'use strict';

var animations = []

function Fn (selector) {
  var i = 0
    , nodes = []
    , results = []

  if (selector instanceof Fn) {
    return selector
  }
  this.element = selector
  if (typeof selector === 'string') {
    if (selector.indexOf('#') === 0) {
      this.element = document.getElementById(selector.slice(1))
    }
    if (selector.indexOf('.') === 0) {
      nodes = document.getElementsByClassName(selector.slice(1))
      for (i = 0; i < nodes.length; i += 1) {
        results.push(new Fn(nodes[i]))
      }
      return results
    }
    if (selector.indexOf('<') === 0) {
      selector = selector.slice(1, -1)
      nodes = document.getElementsByTagName(selector)
      for (i = 0; i < nodes.length; i += 1) {
        results.push(new Fn(nodes[i]))
      }
      return results
    }
  }
  return this
}

Fn.prototype.html = function (value) {
  if (this.element) {
    if (value === undefined) {
      return this.element.innerHTML
    }
    this.element.innerHTML = value
  }
  return this
}

Fn.prototype.int = function () {
  return parseInt(this.html(), 10)
}

Fn.prototype.top = function (value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.style.top, 10)
    }
    this.element.style.top = value + 'px'
  }
}

Fn.prototype.left = function (value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.style.left, 10)
    }
    this.element.style.left = value + 'px'
  }
}

Fn.prototype.toggle = function (klass) {
  if (this.has(klass)) {
    this.remove(klass)
  } else {
    this.add(klass)
  }
}

Fn.prototype.has = function (klass) {
  return this.element && this.element.className.indexOf(klass) >= 0
}

Fn.prototype.add = function (klass) {
  if (this.element) {
    klass = ' ' + klass
    if (this.element.className.indexOf(klass) < 0) {
      this.element.className += klass
    }
  }
}

Fn.prototype.remove = function (klass) {
  if (this.element) {
    var regex = new RegExp('(\\s+)?' + klass, 'g')
    this.element.className = this.element.className.replace(regex, '')
  }
  return this
}

Fn.prototype.on = function (message, callback) {
  if (this.element) {
    this.element.addEventListener(message, callback, false)
  }
}

Fn.prototype.off = function (message, callback) {
  if (this.element) {
    this.element.removeEventListener(message, callback, false)
  }
}

Fn.prototype.center = function () {
  var e = this.element
    , x = 0
    , y = 0

  if (e) {
    x = e.offsetWidth / 2
    y = e.offsetHeight / 2
  }
  while (e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop)) {
    x += e.offsetLeft - e.scrollLeft
    y += e.offsetTop - e.scrollTop
    e = e.offsetParent
  }
  return { x: x, y: y }
}

Fn.prototype.animate = function (klass, callback) {
  var self = this

  function onTransitionEnd () {
    var i = 0
      , temp = []

    for (i = 0; i < animations.length; i += 1) {
      if (animations[i].element !== self &&
          animations[i].callback !== onTransitionEnd &&
          animations[i].klass !== klass) {
        temp.push(animations[i])
      }
    }
    animations = temp
    self.off('webkitTransitionEnd', onTransitionEnd)
    self.off('otransitionend', onTransitionEnd)
    self.off('transitionend', onTransitionEnd)
    self.remove(klass)
    if (callback) {
      callback()
    }
  }

  if (this.element) {
    animations.push({ element: self, callback: onTransitionEnd, klass: klass })
    this.on('webkitTransitionEnd', onTransitionEnd)
    this.on('otransitionend', onTransitionEnd)
    this.on('transitionend', onTransitionEnd)
    this.add(klass)
  }
}

Fn.prototype.name = function () {
  return this.element ? this.element.nodeName : ''
}

Fn.prototype.data = function (value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.getAttribute('data-value'), 10)
    }
    this.element.setAttribute('data-value', value)
  }
  return ''
}

Fn.prototype.klass = function () {
  return this.element ? this.element.className : ''
}

Fn.prototype.kids = function (value) {
  if (this.element) {
    return this.element.getElementsByTagName(value)
  }
  return []
}

Fn.prototype.unwrap = function () {
  return this.element
}

function root (selector) {
  return new Fn(selector)
}

root.fromPoint = function (x, y, obstruction) {
  var element = null
    , hidden = root(obstruction)

  hidden.add('hide')
  element = root(document.elementFromPoint(x, y))
  hidden.remove('hide')
  return element
}

root.stopAnimations = function () {
  var i = 0
    , element = null
    , callback = null
    , klass = null

  for (i = 0; i < animations.length; i += 1) {
    element = animations[i].element
    callback = animations[i].callback
    klass = animations[i].klass
    element.off('webkitTransitionEnd', callback)
    element.off('otransitionend', callback)
    element.off('transitionend', callback)
    element.remove(klass)
  }
}

window.jQuery = root

})()
