var jQuery = (function (doc) {
  "use strict";

  var fn = function (selector) {
    if (selector instanceof fn) {
      return selector;
    }
    this.element = selector;
    if (typeof selector === 'string') {
      this.element = document.getElementById(selector);
    }
    return this;
  },

  root = function (selector) {
    return new fn(selector);
  };

  root.fromPoint = function (x, y) {
    return root(doc.elementFromPoint(x, y));
  };

  fn.prototype.html = function (value) {
    if (this.element) {
      if (value === undefined) {
        return this.element.innerHTML;
      }
      this.element.innerHTML = value;
    }
    return this;
  };

  fn.prototype.top = function (value) {
    if (this.element) {
      if (value === undefined) {
        return parseInt(this.element.style.top);
      }
      this.element.style.top = value + 'px';
    }
  };

  fn.prototype.left = function (value) {
    if (this.element) {
      if (value === undefined) {
        return parseInt(this.element.style.left);
      }
      this.element.style.left = value + 'px';
    }
  };

  fn.prototype.display = function (value) {
    if (this.element) {
      this.element.style.display = value;
    }
  };

  fn.prototype.add = function (klass) {
    if (this.element) {
      klass = ' ' + klass;
      if (this.element.className.indexOf(klass) < 0) {
        this.element.className += klass;
      }
    }
  };

  fn.prototype.remove = function (klass) {
    if (this.element) {
      var regex = new RegExp('(\\s+)?' + klass, 'g');
      this.element.className = this.element.className.replace(regex, '');
    }
  };

  fn.prototype.listen = function (message, callback) {
    if (this.element) {
      this.element.addEventListener(message, callback, false);
    }
  };

  fn.prototype.ignore = function (message, callback) {
    if (this.element) {
      this.element.removeEventListener(message, callback, false);
    }
  };

  fn.prototype.center = function () {
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

  fn.prototype.animate = function (klass, callback) {
    var self = this;
    if (this.element) {
      var wrapper = function () {
        self.ignore('webkitTransitionEnd', wrapper);
        self.ignore('otransitionend', wrapper);
        self.remove(klass);
        if (callback) {
          callback();
        }
      };
      this.listen('webkitTransitionEnd', wrapper);
      this.listen('otransitionend', wrapper);
      this.add(klass);
    }
  };

  fn.prototype.name = function () {
    if (this.element) {
      return this.element.nodeName;
    }
    return '';
  };

  fn.prototype.unwrap = function () {
    return this.element;
  };

  return root;
}(document));
