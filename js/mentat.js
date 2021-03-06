;(function (Mentat) {
'use strict';

var $ = window.jQuery
  , dnd = window.DragDrop
  , doc = $(document)
  , currentPlayer = 2

function countScore (total, factor) {
  return (total % factor === 0) ? total / factor : 0
}

function getScore () {
  return $('#player' + currentPlayer + 'score').int()
}

function setScore (newScore, player) {
  player = player || currentPlayer
  $('#player' + player + 'score').html(newScore)
}

function countUnique (array) {
  var i = 0
    , keys = {}

  for (i = 0; i < array.length; i += 1) {
    keys[array[i]] = 1
  }
  return Object.keys(keys).length
}

function bonusScore (values) {
  var i = 0
    , score = 0
    , straight = 0
    , unique = 0

  if (values.length <= 1) {
    return 0
  }
  unique = countUnique(values)
  if (values.length <= 2) {
    /* a pair */
    if (unique === 1) {
      return 2
    }
    return 0
  }
  if (values.length <= 3) {
    /* a pair */
    if (unique === 2) {
      return 2
    }
    /* three of a kind */
    if (unique === 1) {
      return 6
    }
    return 0
  }
  score = 0
  straight = 0
  values.sort()
  for (i = 0; i < values.length - 1; i += 1) {
    if (values[i] + 1 === values[i + 1]) {
      straight += 1
    }
  }
  /* a straight */
  if (straight === 3) {
    score += 4
  }
  /* a pair */
  if (unique === 3) {
    score += 2
  }
  /* three of a kind */
  if (unique === 2) {
    score += 6
  }
  /* four of a kind */
  if (unique === 1) {
    score += 12
  }
  return score
}

function guessScore (element, guess) {
  var i = 0
    , j = 0
    , value = 0
    , values = []
    , score = getScore()
    , classes = []
    , matches = []
    , total = 0

  element = $(element)
  classes = element.klass().replace(/\s+/g, ' ').split(' ')
  for (i = 0; i < classes.length; i += 1) {
    total = 0
    values = []
    matches = $('.' + classes[i])
    for (j = 0; j < matches.length; j += 1) {
      value = matches[j].data()
      if (guess && matches[j].klass() === element.klass()) {
        value = guess
      }
      if (!isNaN(value)) {
        values.push(value)
        total += value
      }
    }
    score += countScore(total, 3)
    score += countScore(total, 5)
    score += countScore(total, 7)
    score += bonusScore(values)
  }
  return score
}

function isPlayable (element) {
  element = $(element)
  return element.name() === 'TD' && element.html() === ''
}

function getPieces (player) {
  player = player || currentPlayer
  return $('#player' + player + 'pieces').kids('li')
}

function getMode () {
  var player1 = $('#player1icon')
    , player2 = $('#player2icon')

  if (player1.has('human') && player2.has('human')) {
    return 'hvh'
  }
  if (player1.has('human') && player2.has('computer')) {
    return 'hvc'
  }
  if (player1.has('computer') && player2.has('human')) {
    return 'cvh'
  }
  if (player1.has('computer') && player2.has('computer')) {
    return 'cvc'
  }
  return ''
}

function initPieces (player, values) {
  var i = 0
    , mode = getMode()
    , piece = null
    , pieces = getPieces(player)

  for (i = 0; i < pieces.length; i += 1) {
    piece = $(pieces[i])
    piece.html(values.shift())
    piece.remove('hide')
    piece.remove('moving')
    piece.left(0)
    piece.top(0)
    if (mode === 'cvc' ||
       (mode === 'hvc' && player === 1) ||
       (mode === 'cvh' && player === 2)) {
      piece.add('playing')
    } else {
      piece.remove('playing')
    }
  }
}

function initBoard () {
  var i = 0
    , tiles = $('<td>')

  for (i = 0; i < tiles.length; i += 1) {
    tiles[i].html('').data('')
  }
}

function fakeMove (piece, tile, callback) {
  var startX = 0
    , startY = 0

  if (isPlayable(tile)) {
    piece = $(piece)
    tile = $(tile)
    startX = piece.left()
    startY = piece.top()
    piece.add('playing')
    piece.animate('moving', function () {
      callback(piece, tile)
      piece.remove('playing')
      piece.left(startX)
      piece.top(startY)
    })
    piece.left(piece.left() + (tile.center().x - piece.center().x))
    piece.top(piece.top() + (tile.center().y - piece.center().y))
  }
}

function makeMove (callback) {
  var i = 0
    , j = 0
    , tiles = $('<td>')
    , playables = []
    , piece = null
    , pieces = getPieces()
    , value = 0
    , score = 0
    , best = { piece: null, tile: null, score: 0 }

  for (i = 0; i < tiles.length; i += 1) {
    if (isPlayable(tiles[i])) {
      playables.push(tiles[i])
    }
  }

  for (i = 0; i < pieces.length; i += 1) {
    piece = $(pieces[i])
    if (!piece.has('hide')) {
      value = piece.int()
      for (j = 0; j < playables.length; j += 1) {
        score = guessScore(playables[j], value)
        if (score >= best.score) {
          best = { piece: piece, tile: playables[j], score: score }
        }
      }
    }
  }

  fakeMove(best.piece, best.tile, callback)
}

function toggleTurn (callback) {
  var i = 0
    , mode = getMode()
    , pieces = getPieces()
    , klass = ''

  for (i = 0; i < pieces.length; i += 1) {
    dnd.unbind(pieces[i])
    if (mode === 'hvh') {
      $(pieces[i]).remove('playing')
    }
  }

  currentPlayer = (currentPlayer === 1) ? 2 : 1
  klass = (currentPlayer === 1) ? 'dropping-cyan' : 'dropping-yellow'

  pieces = getPieces()
  for (i = 0; i < pieces.length; i += 1) {
    dnd.bind(pieces[i], isPlayable, callback, klass)
    if ((currentPlayer === 1 && mode === 'hvc') ||
        (currentPlayer === 2 && mode === 'cvh') ||
        (mode === 'hvh' || mode === 'cvc')) {
      $(pieces[i]).add('playing')
    }
  }

  if (mode === 'cvc' ||
     (mode === 'cvh' && currentPlayer === 1) ||
     (mode === 'hvc' && currentPlayer === 2)) {
    makeMove(callback)
  }
}

function endTurn (piece, tile) {
  piece = $(piece)
  tile = $(tile)
  tile.data(piece.html())
  tile.html('<span class="' + piece.klass() + '">' + piece.html() + '</span>')
  piece.add('hide')
  setScore(guessScore(tile))
  toggleTurn(endTurn)
}

function shuffle (array) {
  var i = 0
    , j = 0
    , temp

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

function restart () {
  var i = 0
    , j = 0
    , pieces = []

  $.stopAnimations()

  for (i = 0; i < 4; i += 1) {
    for (j = 1; j <= 13; j += 1) {
      pieces.push(j)
    }
  }
  shuffle(pieces)

  currentPlayer = 2

  initPieces(1, pieces)
  initPieces(2, pieces)
  initBoard()

  setScore(0, 1)
  setScore(0, 2)

  toggleTurn(endTurn)
}

function onIconPress (e) {
  var element = $(e.currentTarget)

  function onIconRelease () {
    doc.off('mouseup', onIconRelease)
    element.toggle('human')
    element.toggle('computer')
    restart()
    return false
  }

  doc.on('mouseup', onIconRelease)
  return false
}

Mentat.play = function () {
  function onInfoRelease () {
    doc.off('mouseup', onInfoRelease)
    $('#notes').toggle('hide')
  }

  function onInfoPress () {
    doc.on('mouseup', onInfoRelease)
  }

  $('#player1icon').on('mousedown', onIconPress)
  $('#player2icon').on('mousedown', onIconPress)
  $('#notes').add('hide')
  $('#info').on('mousedown', onInfoPress)

  restart()
}

})(window.Mentat = window.Mentat || {})
