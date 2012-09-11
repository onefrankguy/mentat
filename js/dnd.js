var DragDrop = (function ($, doc) {
  "use strict";

  var initialX = 0
    , initialY = 0
    , startX = 0
    , startY = 0
    , dragged = $()
    , dropped = $()
    , droppable = null
    , fin = null

    , bind = function (element, check, done) {
        element = $(element);
        element.listen('mousedown', onStart);
        element.left(0);
        element.top(0);
        droppable = check;
        fin = done;
      }

    , unbind = function (element) {
        $(element).ignore('mousedown', onStart);
      }

    , onStart = function (e) {
        if (dragged.unwrap()) {
          onStop();
        }
        dragged = $(this);
        dragged.add('dragging');
        startX = dragged.left();
        startY = dragged.top();
        initialX = e.clientX;
        initialY = e.clientY;
        doc.listen('mousemove', onMove);
        doc.listen('mouseup', onStop);
        return false;
      }

    , onMove = function (e) {
        dragged.left(startX + (e.clientX - initialX));
        dragged.top(startY + (e.clientY - initialY));
        dropped.remove('dropping');
        dragged.display('none');
        dropped = $.fromPoint(e.clientX, e.clientY);
        dragged.display('inline-block');
        if (droppable(dropped)) {
          dropped.add('dropping');
        }
        return false;
      }

    , onStop = function (e) {
        doc.ignore('mouseup', onStop);
        doc.ignore('mousemove', onMove);
        dragged.remove('dragging');
        dragged.display('none');
        dropped = $.fromPoint(e.clientX, e.clientY);
        if (droppable(dropped)) {
          fin(dragged, dropped);
        } else {
          dragged.display('inline-block');
          dragged.left(startX);
          dragged.top(startY);
        }
        dropped.remove('dropping');
        dropped = $();
        dragged = $();
        return false;
      }
    ;

    return { bind: bind, unbind: unbind };

}(jQuery, jQuery(document)));
