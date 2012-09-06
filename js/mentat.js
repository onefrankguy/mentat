(function () {
"use strict";

var i, j, pieces = [];

function $(id) {
  return document.getElementById(id);
}

function html(id, text) {
  $(id).innerHTML = text;
}

var dragDrop = {
  initialMouseX: null,
  initialMouseY: null,
  startX: null,
  startY: null,
  draggedObject: null,

  bind: function (element) {
    if (typeof element === "string") {
      element = $(element);
    }
    element.onmousedown = dragDrop.startDragMouse;
  },

  startDragMouse: function (e) {
    dragDrop.startDrag(this);
    dragDrop.initialMouseX = e.clientX;
    dragDrop.initialMouseY = e.clientY;
    document.addEventListener("mousemove", dragDrop.dragMouse, false);
    document.addEventListener("mouseup", dragDrop.releaseElement, false);
    return false;
  },

  startDrag: function (object) {
    if (dragDrop.draggedObjct) {
      dragDrop.releaseElement();
    }
    if (isNaN(parseInt(object.style.left))) {
      object.style.left = "0px";
    }
    if (isNaN(parseInt(object.style.top))) {
      object.style.top = "0px";
    }
    dragDrop.startX = parseInt(object.style.left);
    dragDrop.startY = parseInt(object.style.top);
    dragDrop.draggedObject = object;
  },

  dragMouse: function (e) {
    var dx = e.clientX - dragDrop.initialMouseX;
    var dy = e.clientY - dragDrop.initialMouseY;
    dragDrop.draggedObject.style.left = dragDrop.startX + dx + "px";
    dragDrop.draggedObject.style.top = dragDrop.startY + dy + "px";
    return false;
  },

  releaseElement: function (e) {
    var under = null;
    document.removeEventListener("mousemove", dragDrop.dragMouse, false);
    document.removeEventListener("mouseup", dragDrop.releaseElement, false);
    dragDrop.draggedObject.style.display = 'none';
    under = document.elementFromPoint(e.clientX, e.clientY);
    if (under && under.nodeName === 'TD' && under.innerHTML === '') {
      under.innerHTML = dragDrop.draggedObject.innerHTML;
      dragDrop.draggedObject.parentNode.removeChild(dragDrop.draggedObject);
    } else {
      dragDrop.draggedObject.style.display = 'inline-block';
    }
    dragDrop.draggedObject = null;
  }
}

function shuffle(array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

for (i = 0; i < 4; i += 1) {
  for (j = 1; j <= 13; j += 1) {
    pieces.push(j);
  }
}
shuffle(pieces);

for (i = 0; i < 8; i += 1) {
  html("piece" + i, pieces[i]);
  dragDrop.bind("piece" + i);
}

}());
