(function () {
"use strict";

var i, j, k, pieces, currentPlayer, numberOfPlayers, dragDrop;

currentPlayer = 2;
numberOfPlayers = 1;

function $(id) {
  return document.getElementById(id);
}

function html(id, text) {
  $(id).innerHTML = text;
}

function addClass(selector, value) {
  if (typeof selector === 'string') {
    selector = $(selector);
  }
  selector.className += ' ' + value;
}

function removeClass(selector, value) {
  var regex = new RegExp(' ' + value, 'g');
  if (typeof selector === 'string') {
    selector = $(selector);
  }
  selector.className = selector.className.replace(regex, '');
}

function animate(element, klass, callback) {
  var wrapper = function () {
    if (callback) {
      callback();
    }
    removeClass(element, klass);
    element.removeEventListener('webkitTransitionEnd', wrapper, true);
  };
  element.addEventListener('webkitTransitionEnd', wrapper, true);
  addClass(element, klass);
}

function findCenter(element) {
  var x = 0, y = 0;
  if (element) {
    x = element.offsetWidth / 2;
    y = element.offsetHeight / 2;
  }
  while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
    x += element.offsetLeft - element.scrollLeft;
    y += element.offsetTop - element.scrollTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}

function countScore(total, factor) {
  return (total % factor === 0) ? total / factor : 0;
}

function getScore() {
  return parseInt($('player' + currentPlayer + '-score').innerHTML, 10);
}

function setScore(newScore) {
  html('player' + currentPlayer + '-score', newScore);
}

function countUnique(array) {
  var i, keys;
  keys = {};
  for (i = 0; i < array.length; i += 1) {
    keys[array[i]] = 1;
  }
  return Object.keys(keys).length;
}

function bonusScore(values) {
  var i, score, straight, unique;
  if (values.length <= 1) {
    return 0;
  }
  unique = countUnique(values);
  if (values.length <= 2) {
    /* a pair */
    if (unique === 1) {
      return 2;
    }
    return 0;
  }
  if (values.length <= 3) {
    /* a pair */
    if (unique === 2) {
      return 2;
    }
    /* three of a kind */
    if (unique === 1) {
      return 6;
    }
    return 0;
  }
  score = 0;
  straight = 0;
  values.sort();
  for (i = 0; i < values.length - 1; i += 1) {
    if (values[i] + 1 === values[i + 1]) {
      straight += 1;
    }
  }
  /* a straight */
  if (straight === 3) {
    score += 4;
  }
  /* a pair */
  if (unique === 3) {
    score += 2;
  }
  /* three of a kind */
  if (unique === 2) {
    score += 6;
  }
  /* four of a kind */
  if (unique === 1) {
    score += 12;
  }
  return score;
}

function guessScore(element, guess) {
  var i, j, value, values, score, classes, matches, total;
  score = getScore();
  classes = element.className.replace(/\s+/g, ' ').split(' ');
  for (i = 0; i < classes.length; i += 1) {
    total = 0;
    values = [];
    matches = document.getElementsByClassName(classes[i]);
    for (j = 0; j < matches.length; j += 1) {
      value = parseInt(matches[j].innerHTML, 10);
      if (guess && matches[j] === element) {
        value = guess;
      }
      if (!isNaN(value)) {
        values.push(value);
        total += value;
      }
    }
    score += countScore(total, 3);
    score += countScore(total, 5);
    score += countScore(total, 7);
    score += bonusScore(values);
  }
  return score;
}

function updateScore(element) {
  setScore(guessScore(element));
}

function isPlayable(element) {
  return element && element.nodeName === 'TD' && element.innerHTML === '';
}

function makeMove() {
  var i, j, tiles, playables, piece, pieces, value, score, scores, best;

  tiles = document.getElementsByTagName('td');
  playables = [];
  for (i = 0; i < tiles.length; i += 1) {
    if (isPlayable(tiles[i])) {
      playables.push(tiles[i]);
    }
  }

  pieces = [];
  for (i = 0; i < 8; i += 1) {
    piece = $("piece" + currentPlayer + i);
    if (piece) {
      pieces.push(piece);
    }
  }

  best = { piece: undefined, tile: undefined, score: 0 };
  for (i = 0; i < pieces.length; i += 1) {
    value = parseInt(pieces[i].innerHTML, 10);
    for (j = 0; j < playables.length; j += 1) {
      score = guessScore(playables[j], value);
      if (score >= best.score) {
        best = { piece: pieces[i], tile: playables[j], score: score };
      }
    }
  }

  fakeMove(best.piece, best.tile);

  if (best.piece && best.tile) {
    console.log('Best move is:');
    console.log('Piece: ' + best.piece.innerHTML);
    console.log('Tile: ' + best.tile.className);
    console.log('Score: ' + best.score);
  }
}

function toggleTurn() {
  var i;
  for (i = 0; i < 8; i += 1) {
    dragDrop.unbind("piece" + currentPlayer + i);
  }
  currentPlayer = (currentPlayer === 1) ? 2 : 1;
  for (i = 0; i < 8; i += 1) {
    dragDrop.bind("piece" + currentPlayer + i);
  }
  if (numberOfPlayers === 0 || (numberOfPlayers === 1 && currentPlayer === 2)) {
    makeMove();
  }
}

function endTurn(piece, tile) {
  if (piece && tile) {
    tile.innerHTML = piece.innerHTML;
    piece.parentNode.removeChild(piece);
    updateScore(tile);
    toggleTurn();
  }
}

dragDrop = {
  initialMouseX: null,
  initialMouseY: null,
  startX: null,
  startY: null,
  draggedObject: null,
  droppedObject: null,

  bind: function (element) {
    if (typeof element === "string") {
      element = $(element);
    }
    if (element) {
      if (currentPlayer === 1 || numberOfPlayers !== 1) {
        addClass(element, 'playing');
      }
      element.addEventListener("mousedown", dragDrop.startDragMouse, false);
      element.style.top = "0px";
      element.style.left = "0px";
    }
  },

  unbind: function (element) {
    if (typeof element === "string") {
      element = $(element);
    }
    if (element) {
      if (numberOfPlayers >= 2) {
        removeClass(element, 'playing');
      }
      element.removeEventListener("mousedown", dragDrop.startDragMouse, false);
    }
  },

  startDragMouse: function (e) {
    dragDrop.startDrag(this);
    dragDrop.initialMouseX = e.clientX;
    dragDrop.initialMouseY = e.clientY;
    document.addEventListener("mousemove", dragDrop.dragMouse, false);
    document.addEventListener("mouseup", dragDrop.releaseElement, false);
    addClass(dragDrop.draggedObject, 'dragging');
    return false;
  },

  startDrag: function (object) {
    if (dragDrop.draggedObjct) {
      dragDrop.releaseElement();
    }
    dragDrop.startX = parseInt(object.style.left, 10);
    dragDrop.startY = parseInt(object.style.top, 10);
    dragDrop.draggedObject = object;
  },

  dragMouse: function (e) {
    var dx, dy;
    dx = e.clientX - dragDrop.initialMouseX;
    dy = e.clientY - dragDrop.initialMouseY;
    dragDrop.draggedObject.style.left = dragDrop.startX + dx + "px";
    dragDrop.draggedObject.style.top = dragDrop.startY + dy + "px";
    if (dragDrop.droppedObject) {
      removeClass(dragDrop.droppedObject, 'dropping');
    }
    dragDrop.draggedObject.style.display = 'none';
    dragDrop.droppedObject = document.elementFromPoint(e.clientX, e.clientY);
    dragDrop.draggedObject.style.display = 'inline-block';
    if (isPlayable(dragDrop.droppedObject)) {
      addClass(dragDrop.droppedObject, 'dropping');
    }
    return false;
  },

  releaseElement: function (e) {
    var under = null;
    document.removeEventListener("mousemove", dragDrop.dragMouse, false);
    document.removeEventListener("mouseup", dragDrop.releaseElement, false);
    removeClass(dragDrop.draggedObject, 'dragging');
    dragDrop.draggedObject.style.display = 'none';
    under = document.elementFromPoint(e.clientX, e.clientY);
    if (isPlayable(under)) {
      endTurn(dragDrop.draggedObject, under);
    } else {
      dragDrop.draggedObject.style.display = 'inline-block';
      dragDrop.draggedObject.style.left = dragDrop.startX + "px";
      dragDrop.draggedObject.style.top = dragDrop.startY + "px";
    }
    dragDrop.draggedObject = null;
    if (dragDrop.droppedObject) {
      removeClass(dragDrop.droppedObject, 'dropping');
    }
    dragDrop.droppedObject = null;
  }
};

function fakeMove(piece, tile) {
  var pieceCenter, tileCenter;

  if (isPlayable(tile)) {
    pieceCenter = findCenter(piece);
    tileCenter = findCenter(tile);
    addClass(piece, 'playing');
    animate(piece, 'moving', function () { endTurn(piece, tile); });
    piece.style.left = parseInt(piece.style.left, 10) + (tileCenter.x - pieceCenter.x) + 'px';
    piece.style.top = parseInt(piece.style.top, 10) + (tileCenter.y - pieceCenter.y) + 'px';
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

pieces = [];
for (i = 0; i < 4; i += 1) {
  for (j = 1; j <= 13; j += 1) {
    pieces.push(j);
  }
}
shuffle(pieces);

for (i = 0, j = 0, k = 0; i < 16; i += 1) {
  if (i % 2 === 0) {
    html("piece1" + j, pieces[i]);
    j += 1;
  } else {
    html("piece2" + k, pieces[i]);
    k += 1;
  }
}

toggleTurn();

}());
