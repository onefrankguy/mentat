var Mentat = (function ($, dnd) {
  'use strict';

  var doc = $(document)
    , currentPlayer = 2
    , numberOfPlayers = 1

    , countScore = function (total, factor) {
        return (total % factor === 0) ? total / factor : 0;
      }

    , getScore = function () {
        return $('#player' + currentPlayer + 'score').int();
      }

    , setScore = function (newScore) {
        $('#player' + currentPlayer + 'score').html(newScore);
      }

    , countUnique = function (array) {
        var i = 0
          , keys = {}
          ;

        for (i = 0; i < array.length; i += 1) {
          keys[array[i]] = 1;
        }
        return Object.keys(keys).length;
      }

    , bonusScore = function (values) {
        var i = 0
          , score = 0
          , straight = 0
          , unique = 0
          ;

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

    , guessScore = function (element, guess) {
        var i = 0
          , j = 0
          , value = 0
          , values = []
          , score = getScore()
          , classes = []
          , matches = []
          , total = 0
          ;

        element = $(element);
        classes = element.klass().replace(/\s+/g, ' ').split(' ');
        for (i = 0; i < classes.length; i += 1) {
          total = 0;
          values = [];
          matches = $('.' + classes[i]);
          for (j = 0; j < matches.length; j += 1) {
            value = matches[j].data();
            if (guess && matches[j].klass() === element.klass()) {
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

      , isPlayable = function (element) {
          element = $(element);
          return element.name() === 'TD' && element.html() === '';
        }

      , getPieces = function (player) {
          if (player === undefined) {
            player = currentPlayer;
          }
          return $('#player' + player + 'pieces').kids('li');
        }

      , initPieces = function (player, values) {
          var i = 0
            , pieces = getPieces(player)
            ;

          for (i = 0; i < pieces.length; i += 1) {
            $(pieces[i]).html(values.shift());
          }
        }

      , fakeMove = function (piece, tile) {
          if (isPlayable(tile)) {
            piece = $(piece);
            tile = $(tile);
            piece.add('playing');
            piece.animate('moving', function () { endTurn(piece, tile); });
            piece.left(piece.left() + (tile.center().x - piece.center().x));
            piece.top(piece.top() + (tile.center().y - piece.center().y));
          }
        }

      , makeMove = function () {
          var i = 0
            , j = 0
            , tiles = $('<td>')
            , playables = []
            , piece = null
            , pieces = getPieces()
            , value = 0
            , score = 0
            , best = { piece: undefined, tile: undefined, score: 0 }
            ;

          for (i = 0; i < tiles.length; i += 1) {
            if (isPlayable(tiles[i])) {
              playables.push(tiles[i]);
            }
          }

          for (i = 0; i < pieces.length; i += 1) {
            value = $(pieces[i]).int();
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

        , toggleTurn = function () {
            var i = 0
              , pieces = getPieces()
              ;

            for (i = 0; i < pieces.length; i += 1) {
              dnd.unbind(pieces[i]);
              if (numberOfPlayers >= 2) {
                $(pieces[i]).remove('playing');
              }
            }

            currentPlayer = (currentPlayer === 1) ? 2 : 1;

            pieces = getPieces();
            for (i = 0; i < pieces.length; i += 1) {
              dnd.bind(pieces[i], isPlayable, endTurn);
              if (currentPlayer === 1 || numberOfPlayers !== 1) {
                $(pieces[i]).add('playing');
              }
            }

            if (numberOfPlayers === 0 || (numberOfPlayers === 1 && currentPlayer === 2)) {
              makeMove();
            }
          }

        , endTurn = function (piece, tile) {
            piece = $(piece);
            tile = $(tile);
            console.log(piece.klass());
            tile.data(piece.html());
            tile.html('<span class="'+piece.klass()+' piece">'+piece.html()+'</span>');
            piece.vanish();
            setScore(guessScore(tile));
            toggleTurn();
        }

        , shuffle = function (array) {
            var i = 0
              , j = 0
              , temp
              ;

            for (i = array.length - 1; i > 0; i -= 1) {
              j = Math.floor(Math.random() * (i + 1));
              temp = array[i];
              array[i] = array[j];
              array[j] = temp;
            }
          }

        , restart = function () {
            var i = 0
              , j = 0
              , pieces = []
              ;

            for (i = 0; i < 4; i += 1) {
              for (j = 1; j <= 13; j += 1) {
                pieces.push(j);
              }
            }
            shuffle(pieces);

            initPieces(1, pieces);
            initPieces(2, pieces);

            currentPlayer = 2;
            toggleTurn();
          }

        , onIconPress = function (e) {
            var element = $(this), wrapper = function (e) {
              doc.off('mouseup', wrapper);
              if (element.has('human-icon')) {
                element.remove('human-icon');
                element.add('computer-icon');
              } else if (element.has('computer-icon')) {
                element.remove('computer-icon');
                element.add('human-icon');
              }
              return false;
            };
            doc.on('mouseup', wrapper);
            return false;
          }

        , play = function () {
            $('#player1icon').on('mousedown', onIconPress);
            $('#player2icon').on('mousedown', onIconPress);
            restart();
          }
        ;

        return { play: play };

}(jQuery, DragDrop));

Mentat.play();
