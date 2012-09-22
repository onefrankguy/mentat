;(function (DragDrop) {
'use strict'

var $ = window.jQuery
  , doc = $(document)
  , initialX = 0
  , initialY = 0
  , startX = 0
  , startY = 0
  , dragged = $()
  , dropped = $()
  , droppable = null
  , fin = null
  , dropping = ''

function onMove (e) {
  dragged.left(startX + (e.clientX - initialX))
  dragged.top(startY + (e.clientY - initialY))
  dropped.remove(dropping)
  dropped = $.fromPoint(e.clientX, e.clientY, dragged)
  if (droppable(dropped)) {
    dropped.add(dropping)
  }
  return false
}

function onStop (e) {
  doc.off('mouseup', onStop)
  doc.off('mousemove', onMove)
  dragged.remove('dragging')
  dropped = $.fromPoint(e.clientX, e.clientY, dragged)
  dropped.remove(dropping)
  if (droppable(dropped)) {
    fin(dragged, dropped)
  }
  dragged.left(startX)
  dragged.top(startY)
  dropped = $()
  dragged = $()
  return false
}

function onStart (e) {
  if (dragged.unwrap()) {
    onStop()
  }
  dragged = $(e.currentTarget)
  dragged.add('dragging')
  startX = dragged.left()
  startY = dragged.top()
  initialX = e.clientX
  initialY = e.clientY
  doc.on('mousemove', onMove)
  doc.on('mouseup', onStop)
  return false
}

DragDrop.bind = function (element, check, done, klass) {
  element = $(element)
  element.on('mousedown', onStart)
  element.left(0)
  element.top(0)
  droppable = check
  fin = done
  dropping = klass
}

DragDrop.unbind = function (element) {
  $(element).off('mousedown', onStart)
}

})(window.DragDrop = window.DragDrop || {})
