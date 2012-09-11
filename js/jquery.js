var jQuery = (function (doc) {
  'use strict';

  var Fn = function (selector) {
    var i, nodes, results = [];
    if (selector instanceof Fn) {
      return selector;
    }
    this.element = selector;
    if (typeof selector === 'string') {
      if (selector.indexOf('#') === 0) {
        this.element = document.getElementById(selector.slice(1));
      }
      if (selector.indexOf('.') === 0) {
        nodes = doc.getElementsByClassName(selector.slice(1));
        for (i = 0; i < nodes.length; i += 1) {
          results.push(new Fn(nodes[i]));
        }
        return results;
      }
      if (selector.indexOf('<') === 0) {
        selector = selector.slice(1, -1);
        nodes = doc.getElementsByTagName(selector);
        for (i = 0; i < nodes.length; i += 1) {
          results.push(new Fn(nodes[i]));
        }
        return results;
      }
    }
    return this;
  },

  root = function (selector) {
    return new Fn(selector);
  };

  root.fromPoint = function (x, y) {
    return root(doc.elementFromPoint(x, y));
  };

  Fn.prototype.html = function (value) {
    if (this.element) {
      if (value === undefined) {
        return this.element.innerHTML;
      }
      this.element.innerHTML = value;
    }
    return this;
  };

  Fn.prototype.int = function () {
    return parseInt(this.html(), 10);
  };

  Fn.prototype.top = function (value) {
    if (this.element) {
      if (value === undefined) {
        return parseInt(this.element.style.top, 10);
      }
      this.element.style.top = value + 'px';
    }
  };

  Fn.prototype.left = function (value) {
    if (this.element) {
      if (value === undefined) {
        return parseInt(this.element.style.left, 10);
      }
      this.element.style.left = value + 'px';
    }
  };

  Fn.prototype.display = function (value) {
    if (this.element) {
      this.element.style.display = value;
    }
  };

  Fn.prototype.has = function (klass) {
    if (this.element) {
      return this.element.className.indexOf(klass) >= 0;
    }
    return false;
  };

  Fn.prototype.add = function (klass) {
    if (this.element) {
      klass = ' ' + klass;
      if (this.element.className.indexOf(klass) < 0) {
        this.element.className += klass;
      }
    }
  };

  Fn.prototype.remove = function (klass) {
    if (this.element) {
      var regex = new RegExp('(\\s+)?' + klass, 'g');
      this.element.className = this.element.className.replace(regex, '');
    }
  };

  Fn.prototype.on = function (message, callback) {
    if (this.element) {
      this.element.addEventListener(message, callback, false);
    }
  };

  Fn.prototype.off = function (message, callback) {
    if (this.element) {
      this.element.removeEventListener(message, callback, false);
    }
  };

  Fn.prototype.center = function () {
    var e = this.element, x = 0, y = 0;
    if (e) {
      x = e.offsetWidth / 2;
      y = e.offsetHeight / 2;
    }
    while (e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop)) {
      x += e.offsetLeft - e.scrollLeft;
      y += e.offsetTop - e.scrollTop;
      e = e.offsetParent;
    }
    return { x: x, y: y };
  };

  Fn.prototype.animate = function (klass, callback) {
    var wrapper, self = this;
    if (this.element) {
      wrapper = function () {
        self.off('webkitTransitionEnd', wrapper);
        self.off('otransitionend', wrapper);
        self.remove(klass);
        if (callback) {
          callback();
        }
      };
      this.on('webkitTransitionEnd', wrapper);
      this.on('otransitionend', wrapper);
      this.add(klass);
    }
  };

  Fn.prototype.name = function () {
    if (this.element) {
      return this.element.nodeName;
    }
    return '';
  };

  Fn.prototype.data = function (value) {
    if (this.element) {
      if (value === undefined) {
        return parseInt(this.element.getAttribute('data-value'), 10);
      }
      this.element.setAttribute('data-value', value);
    }
    return '';
  };

  Fn.prototype.klass = function () {
    if (this.element) {
      return this.element.className;
    }
    return '';
  };

  Fn.prototype.vanish = function () {
    if (this.element) {
      this.element.parentNode.removeChild(this.element);
    }
  };

  Fn.prototype.kids = function (value) {
    if (this.element) {
      return this.element.getElementsByTagName(value);
    }
    return [];
  };

  Fn.prototype.unwrap = function () {
    return this.element;
  };

  return root;
}(document));
