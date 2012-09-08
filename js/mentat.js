(function () {
"use strict";

var i, j, k, pieces, currentPlayer, singlePlayer;

currentPlayer = 2;
singlePlayer = true;

function $(id) {
  return document.getElementById(id);
}

function html(id, text) {
  $(id).innerHTML = text;
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
  return parseInt($('player' + currentPlayer + '-score').innerHTML);
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
    if (unique === 1) return 2;
    return 0;
  }
  if (values.length <= 3) {
    /* a pair */
    if (unique === 2) return 2;
    /* three of a kind */
    if (unique === 1) return 6;
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
  if (straight === 3) score += 4;
  /* a pair */
  if (unique === 3) score += 2;
  /* three of a kind */
  if (unique === 2) score += 6;
  /* four of a kind */
  if (unique === 1) score += 12;
  return score;
}

function updateScore(element) {
  setScore(guessScore(element));
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
      value = parseInt(matches[j].innerHTML);
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

function isPlayable(element) {
  return element && element.nodeName === 'TD' && element.innerHTML === '';
}

var dragDrop = {
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
      element.addEventListener("mousedown", dragDrop.startDragMouse, false);
      element.style.color = "#000";
    }
  },

  unbind: function (element) {
    if (typeof element === "string") {
      element = $(element);
    }
    if (element) {
      element.removeEventListener("mousedown", dragDrop.startDragMouse, false);
      element.style.color = "#fff";
    }
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
    if (dragDrop.droppedObject) {
      dragDrop.droppedObject.className = dragDrop.droppedObject.className.replace(/ dropping/g, '');
    }
    dragDrop.draggedObject.style.display = 'none';
    dragDrop.droppedObject = document.elementFromPoint(e.clientX, e.clientY);
    dragDrop.draggedObject.style.display = 'inline-block';
    if (isPlayable(dragDrop.droppedObject)) {
      dragDrop.droppedObject.className += ' dropping';
    }
    return false;
  },

  releaseElement: function (e) {
    var under = null;
    document.removeEventListener("mousemove", dragDrop.dragMouse, false);
    document.removeEventListener("mouseup", dragDrop.releaseElement, false);
    dragDrop.draggedObject.style.display = 'none';
    under = document.elementFromPoint(e.clientX, e.clientY);
    if (isPlayable(under)) {
      under.innerHTML = dragDrop.draggedObject.innerHTML;
      dragDrop.draggedObject.parentNode.removeChild(dragDrop.draggedObject);
      updateScore(under);
      toggleTurn();
    } else {
      dragDrop.draggedObject.style.display = 'inline-block';
      dragDrop.draggedObject.style.left = dragDrop.startX + "px";
      dragDrop.draggedObject.style.top = dragDrop.startY + "px";
    }
    dragDrop.draggedObject = null;
    if (dragDrop.droppedObject) {
      dragDrop.droppedObject.style.background = "#fff";
    }
    dragDrop.droppedObject = null;
  }
}

function fakeMove(piece, tile) {
  var pieceCenter, tileCenter, fakeMouseDown, fakeMouseUp;

  pieceCenter = findCenter(piece);
  fakeMouseDown = document.createEvent('MouseEvents');
  fakeMouseDown.initMouseEvent('mousedown', true, true, window, 0,
      0, 0, pieceCenter.x, pieceCenter.y,
      false, false, false, false, 0, null);
  piece.dispatchEvent(fakeMouseDown);

  tileCenter = findCenter(tile);
  fakeMouseUp = document.createEvent('MouseEvents');
  fakeMouseUp.initMouseEvent('mouseup', true, true, window, 0,
      0, 0, tileCenter.x, tileCenter.y,
      false, false, false, false, 0, null);
  tile.dispatchEvent(fakeMouseUp);
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
    value = parseInt(pieces[i].innerHTML);
    for (j = 0; j < playables.length; j += 1) {
      score = guessScore(playables[j], value);
      if (score >= best.score) {
        best = { piece: pieces[i], tile: playables[j], score: score };
      }
    }
  }

  fakeMove(best.piece, best.tile);

  console.log('Best move is:');
  console.log('Piece: ' + best.piece.innerHTML);
  console.log('Tile: ' + best.tile.className);
  console.log('Score: ' + best.score);
}

function toggleTurn() {
  var i;
  for (i = 0; i < 8; i += 1) {
    dragDrop.unbind("piece1" + i);
    dragDrop.unbind("piece2" + i);
  }
  currentPlayer = (currentPlayer === 1) ? 2 : 1;
  for (i = 0; i < 8; i += 1) {
    dragDrop.bind("piece" + currentPlayer + i);
  }
  if (singlePlayer && currentPlayer === 2) {
    makeMove();
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
