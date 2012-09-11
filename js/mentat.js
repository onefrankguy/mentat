(function ($) {
"use strict";

var i, j, k, pieces, currentPlayer, numberOfPlayers, endTurn;

currentPlayer = 2;
numberOfPlayers = 1;

function animate(element, klass, callback) {
  element = $(element);
  var wrapper = function () {
    if (callback) {
      callback();
    }
    element.remove(klass);
    element.ignore('webkitTransitionEnd', wrapper);
    element.ignore('otransitionend', wrapper);
  };
  element.listen('webkitTransitionEnd', wrapper);
  element.listen('otransitionend', wrapper);
  element.add(klass);
}

function countScore(total, factor) {
  return (total % factor === 0) ? total / factor : 0;
}

function getScore() {
  return parseInt($('player' + currentPlayer + '-score').html(), 10);
}

function setScore(newScore) {
  $('player' + currentPlayer + '-score').html(newScore);
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
      value = parseInt(matches[j].getAttribute('data-value'), 10);
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
  return element && element.nodeName === 'TD' && $(element).html() === '';
}

function fakeMove(piece, tile) {
  var dx, dy, pieceCenter, tileCenter;

  if (isPlayable(tile)) {
    pieceCenter = $(piece).center();
    tileCenter = $(tile).center();
    $(piece).add('playing');
    animate(piece, 'moving', function () {
      $(piece).remove('moving');
      endTurn(piece, tile);
    });
    dx = tileCenter.x - pieceCenter.x;
    dy = tileCenter.y - pieceCenter.y;
    piece.style.left = parseInt(piece.style.left, 10) + dx + 'px';
    piece.style.top = parseInt(piece.style.top, 10) + dy + 'px';
  }
}

function makeMove() {
  var i, j, tiles, playables, piece, pieces, value, score, best;

  tiles = document.getElementsByTagName('td');
  playables = [];
  for (i = 0; i < tiles.length; i += 1) {
    if (isPlayable(tiles[i])) {
      playables.push(tiles[i]);
    }
  }

  pieces = [];
  for (i = 0; i < 8; i += 1) {
    piece = $("piece" + currentPlayer + i).unwrap();
    if (piece) {
      pieces.push(piece);
    }
  }

  best = { piece: undefined, tile: undefined, score: 0 };
  for (i = 0; i < pieces.length; i += 1) {
    value = parseInt($(pieces[i]).html(), 10);
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
  var i, element;
  for (i = 0; i < 8; i += 1) {
    element = "piece" + currentPlayer + i;
    DragDrop.unbind(element);
    if (numberOfPlayers >= 2) {
      $(element).remove('playing');
    }
  }
  currentPlayer = (currentPlayer === 1) ? 2 : 1;
  for (i = 0; i < 8; i += 1) {
    element = "piece" + currentPlayer + i;
    DragDrop.bind(element, isPlayable, endTurn);
    if (currentPlayer === 1 || numberOfPlayers !== 1) {
      $(element).add('playing');
    }
  }
  if (numberOfPlayers === 0 || (numberOfPlayers === 1 && currentPlayer === 2)) {
    makeMove();
  }
}

endTurn = function(piece, tile) {
  var element;
  if (piece && tile) {
    console.log('Class: ' + piece.className);
    element = '<span class="';
    element += piece.className;
    element += ' piece">' + piece.innerHTML + '</span>';
    tile.setAttribute('data-value', piece.innerHTML);
    tile.innerHTML = element;
    piece.parentNode.removeChild(piece);
    updateScore(tile);
    toggleTurn();
  }
};

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
    $("piece1" + j).html(pieces[i]);
    j += 1;
  } else {
    $("piece2" + k).html(pieces[i]);
    k += 1;
  }
}

toggleTurn();

}(jQuery));
