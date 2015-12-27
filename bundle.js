(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Display = require('./display');
var Shape = require('./shape');

function WebTris() {

    var TILE_RATIO = 20,  // Size of blocks/tiles
        SMALL_TILE_RATIO = 10,  // Next tile screen on the right
        GAME_SPEED = 250, // MS between redraws
        SHAPE_DROP_GAME_SPEED = 16, // Top speed, when dropping
        SHAPE_LANDING_GAME_SPEED = 150, // Allows for a small delay before shape anchored
        SHAPE_ANIMATING_SPEED = 350, // length of line drop animation
        STEP_POINTS = 1, // Points gained by having the shape move one game revolution down
        ALT_STEP_POINTS = 5, // Points gained for faster game revolution
        LINE_CLEAR_POINTS = 50, // Points gained for clearing a single line
        DISPLAY_SIZE = {x:220, y:380}, 
        SMALL_DISPLAY_SIZE = {x:50, y:50},
        DISPLAY_ORIGIN = {x:100, y:0},
        SMALL_DISPLAY_ORIGIN = {x:10, y:10};

    var mainDisplay = new Display(document.getElementById('main-canvas'), TILE_RATIO, DISPLAY_SIZE, DISPLAY_ORIGIN),
        secondaryDisplay = new Display(document.getElementById('secondary-canvas'), TILE_RATIO, DISPLAY_SIZE, DISPLAY_ORIGIN),
        nextDisplay = new Display(document.getElementById('next-shape-canvas'), SMALL_TILE_RATIO, SMALL_DISPLAY_SIZE, SMALL_DISPLAY_ORIGIN),
        pointsEl = document.getElementById('points-value'),
        currentShape,
        nextShape,
        pastShapes = [],
        points = 0;

    var self = this;

    this.init = function() {
      this.assignControls();
      this.stepNextShape();
      this.startAnimation();
    }

    this.assignControls = function() {
      document.onkeydown = checkKey;
      function checkKey(e) {
        if (e.keyCode == '38') {
          self.moveShape('rotate');
        } else if (e.keyCode == '32') {
          self.beginDrop();
        } else if (e.keyCode == '37') {
          self.moveShape('left');
        } else if (e.keyCode == '39') {
          self.moveShape('right');
        }
      }

      var leftBtn   = document.getElementsByClassName('move-left-btn')[0];
      var rightBtn  = document.getElementsByClassName('move-right-btn')[0];
      var rotateBtn = document.getElementsByClassName('rotate-btn')[0];
      var dropBtn   = document.getElementsByClassName('drop-btn')[0];
      var menuBtn   = document.getElementsByClassName('menu-btn')[0];
      var resumeBtn = document.getElementsByClassName('resume-btn')[0];
      var restartBtn  = document.getElementsByClassName('restart-btn')[0];

      leftBtn.addEventListener('touchstart', function(){self.moveShape('left')}, false);
      rightBtn.addEventListener('touchstart', function(){self.moveShape('right')}, false);
      rotateBtn.addEventListener('touchstart', function(){self.moveShape('rotate')}, false);
      dropBtn.addEventListener('touchstart', function(){self.beginDrop()}, false);
      menuBtn.addEventListener('touchstart', function(){self.openMenu()}, false);
      menuBtn.addEventListener('click', function(){self.openMenu()}, false);
      resumeBtn.addEventListener('touchstart', function(){self.resumeGame()}, false);
      resumeBtn.addEventListener('click', function(){self.resumeGame()}, false);
      restartBtn.addEventListener('touchstart', function(){self.restartGame()}, false);
      restartBtn.addEventListener('click', function(){self.restartGame()}, false);

    }

    this.openMenu = function() {
      window.cancelAnimationFrame(self.animReq);
      self.showModal();
    }

    this.resumeGame = function() {
      self.hideModal();
      self.startAnimation();
    }

    this.restartGame = function() {
      pastShapes = [];
      currentShape = null;
      mainDisplay.clearDisplay();
      secondaryDisplay.clearDisplay();
      this.resetPoints();
      self.stepNextShape(); 
      self.resumeGame();
    }

    this.showModal = function() {
      var modalOverlay = document.getElementsByClassName('modal-overlay')[0];
      var modalContainer = document.getElementsByClassName('modal-container')[0];
      modalOverlay.className = modalOverlay.className.replace(/hidden/,'');
      modalContainer.className = modalContainer.className.replace(/hidden/,'');
    }

    this.hideModal = function() {
      var modalOverlay = document.getElementsByClassName('modal-overlay')[0];
      var modalContainer = document.getElementsByClassName('modal-container')[0];
      modalOverlay.className = modalOverlay.className + ' hidden';
      modalContainer.className = modalContainer.className + ' hidden';
    }

    this.getHighScore = function() {

    }

    this.startAnimation = function() {
      var running = true,
          timeAtLastLoop,
          timeAtLastRender;

      function animLoop(timeSinceFirstFrame) {
        timeAtLastLoop = Date.now();
        if(!timeAtLastRender) timeAtLastRender = timeAtLastLoop;
        render(timeSinceFirstFrame);
      }

      function render(timeSinceFirstFrame) {
        if(timeAtLastLoop - timeAtLastRender > self.getGameSpeed()) {
          timeAtLastRender = timeAtLastLoop;
          self.moveShape('down');
        }

        // if(timeSinceFirstFrame < 60000) {
        //   self.animReq = window.requestAnimationFrame(animLoop);
        // }
      }

      self.animReq = window.requestAnimationFrame(animLoop);
    }

    this.beginDrop = function() {
      currentShape._isDropping = true;
    }

    this.getGameSpeed = function() {
      var speed = GAME_SPEED;
      if(currentShape._isDropping) {
        speed = SHAPE_DROP_GAME_SPEED;
      } else if(currentShape._isLanding) {
        speed = SHAPE_LANDING_GAME_SPEED;
      } else if(currentShape._isAnimating) {
        speed = SHAPE_ANIMATING_SPEED;
      }
      return speed;
    }

    this.moveShape = function(direction) {
      var newOrigin = { x:currentShape._origin.x, y:currentShape._origin.y },
          newTiles = currentShape._tiles,
          bor,
          col,
          linesCleared,
          shapeTemp,
          pastShapesTemp;

      if(direction === 'down') {
        newOrigin.y += TILE_RATIO;
        this.updatePoints();
      } else if(direction === 'left') {
        newOrigin.x -= TILE_RATIO;
      } else if(direction === 'right') {
        newOrigin.x += TILE_RATIO;
      } else if(direction === 'rotate') {
        newTiles = currentShape.getRotationTiles();
      }

      borderCol = this.borderCollision(newOrigin, newTiles);
      shapeCol = this.shapeCollision(newOrigin, newTiles);

      if(!borderCol && !shapeCol) {
        mainDisplay.clearDisplay();
        currentShape._origin = newOrigin;
        currentShape._tiles = newTiles;
        mainDisplay.drawShape(currentShape);
      } else if (borderCol === 'bottom' || (direction === 'down' && shapeCol === true) ) {

          pastShapesTemp  = JSON.parse(JSON.stringify(pastShapes));
          shapeTemp       = JSON.parse(JSON.stringify(currentShape));
          pastShapesTemp.push(shapeTemp);
          var linesObj    = this.linesToClear(pastShapesTemp, shapeTemp._origin, shapeTemp._tiles);


          if(currentShape._isDropping && !linesObj.linesCleared.length) {
            currentShape._isDropping = false;
            currentShape._isLanding = true;
          } else if (!currentShape._isAnimating && linesObj.linesCleared.length) {
              this.animateLineClear(linesObj.linesCleared);
              currentShape._isDropping = false;
              currentShape._isLanding = false;
              currentShape._isAnimating = true;
          } else {
            pastShapes = pastShapesTemp;
            secondaryDisplay.clearDisplay();
            mainDisplay.clearDisplay();
            this.redrawSecondaryDisplay();
            this.updatePoints(linesObj.linesCleared.length);
            this.stepNextShape();
            mainDisplay.drawShape(currentShape);    
          }
      }
    }

    this.stepNextShape = function() {
      if(!currentShape) {
        currentShape = new Shape(mainDisplay._drawingOrigin);
        mainDisplay.drawShape(currentShape);
      } else {
        currentShape = nextShape;
      }
      nextShape = new Shape(mainDisplay._drawingOrigin);
      nextDisplay.clearDisplay();
      nextDisplay.drawShape(nextShape, true);
    }

    this.resetPoints = function() {
      points = 0;
      this.updateUIpoints();
    }

    this.updatePoints = function(linesCleared) {
      if(linesCleared) {
        points += linesCleared * LINE_CLEAR_POINTS;
      } else {
        if(this.getGameSpeed() === SHAPE_DROP_GAME_SPEED) {
          points += ALT_STEP_POINTS;
        } else {
          points += STEP_POINTS;
        }
      }
      this.updateUIpoints();
    }

    this.updateUIpoints = function() {
      var pointsString = points.toString();
      while (pointsString.length < 6) {
        pointsString = '0'+pointsString;
      }
      pointsEl.innerHTML = pointsString;
    }

    this.shapeCollision = function(origin, tiles) {
      for(var i = 0; i < pastShapes.length; i++) {
        var pShape = pastShapes[i];

        for(var j = 0; j < pShape._tiles.length; j++) {
          var pTile = pShape._tiles[j];
          var pastX = pShape._origin.x + pTile.x*TILE_RATIO;
          var pastY = pShape._origin.y + pTile.y*TILE_RATIO;

          for(var k = 0; k < tiles.length; k++) {
            var newX = origin.x + tiles[k].x*TILE_RATIO;
            var newY = origin.y + tiles[k].y*TILE_RATIO;
            if(pastX == newX && pastY == newY ) {
              return true;
            }
          }
        }
      }
    }

    this.borderCollision = function(origin, tiles) {
      var colLeft = 0;
      var colRight = 0;
      var colTop = 0;
      var colBottom = 0;

      for (var i = 0; i < tiles.length; i++) {
        var left    = origin.x + tiles[i].x*TILE_RATIO;
        var right   = origin.x + tiles[i].x*TILE_RATIO + TILE_RATIO;
        var top     = origin.y + tiles[i].y*TILE_RATIO;
        var bottom  = origin.y + tiles[i].y*TILE_RATIO + TILE_RATIO;

        if(left < 0 && left < colLeft) {
          colLeft = left;
        }
        if(right > DISPLAY_SIZE.x && right > colRight) {
          colRight = right;
        }
        if(left < 0 && left < colLeft) {
          colLeft = left;
        }
        if(bottom > DISPLAY_SIZE.y && bottom > colBottom) {
          colBottom = bottom;
        }
      }

      if(colRight > 0 || colLeft < 0) {
        return 'sides';
      } else if (colBottom > 0) {
        return 'bottom';
      }
    }

    this.linesToClear = function(shapesArr, origin, tiles) {
      //get affected lines
      var lines = [];
      var maxTilesInLine = Math.floor(DISPLAY_SIZE.x / TILE_RATIO);
      var linesCleared = [];

      // mark the lines affected by current landed shape tiles
      for (var i = 0; i < tiles.length; i++) {
        var lineExists = false;
        for (var j = 0; j < lines.length; j++) {
         if(origin.y+tiles[i].y*TILE_RATIO === lines[j].lineY) lineExists = true;
        }
        if(!lineExists) {
          var myObj = {lineY: origin.y+tiles[i].y*TILE_RATIO, tilesInLine:0};
          lines.push(myObj);
        }
      }

      // iterate all the shapes and their tiles, count tiles in each marked line (more efficient than checking all shapes)
      for (var i = 0; i < shapesArr.length; i++) {
        for(var j = 0; j < shapesArr[i]._tiles.length; j++) {
          var tileY = shapesArr[i]._origin.y + shapesArr[i]._tiles[j].y*TILE_RATIO;

          for (var k = 0; k < lines.length; k++) {
           if(tileY === lines[k].lineY) {
             lines[k].tilesInLine++;
           }
          }
        }
      }

      // erase tiles from full lines, update rest of other tiles' Y to be a line lower
      for (var i = 0; i < lines.length; i++) {

        if(lines[i].tilesInLine === maxTilesInLine) {
          var eraseY = lines[i].lineY;
          linesCleared.push(lines[i]);

          for (var j = 0; j < shapesArr.length; j++) {
            var k = shapesArr[j]._tiles.length;

            while(k--) {
              var tileY = shapesArr[j]._origin.y + shapesArr[j]._tiles[k].y*TILE_RATIO;

              if(tileY < eraseY) {
                shapesArr[j]._tiles[k].y += 1;
              }
              else if (tileY === eraseY){
                shapesArr[j]._tiles.splice(k,1);
              }
            }
          }
        }

      }

      return {shapesArr:shapesArr, linesCleared:linesCleared};
    }

    this.animateLineClear = function(linesCleared) {
    var alpha = 0;
    var ctx = mainDisplay._ctx;
    var interval = setInterval(function () {
            ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
            ctx.fillRect(0, linesCleared[0].lineY, mainDisplay._size.x, linesCleared.length*TILE_RATIO);
            alpha = alpha + 0.1; 
            if (alpha >= 1) {
                clearInterval(interval);
            }
        }, 25); 

    }

    this.redrawSecondaryDisplay = function() {
      secondaryDisplay.clearDisplay();
      secondaryDisplay.drawShapes(pastShapes);
    }

}

window.onload = function(){
  var game = new WebTris();
      game.init();
}

},{"./display":2,"./shape":3}],2:[function(require,module,exports){
function Display(canvasEl, tileRatio, size, drawingOrigin) {
  // initing draw scrrren
  this._canvasEl = canvasEl;
  this._tileRatio = tileRatio;
  this._size = size;
  this._drawingOrigin = drawingOrigin;

  // inittin our draw area
  this._canvasEl.setAttribute('width', this._size.x);
  this._canvasEl.setAttribute('height', this._size.y);

  // setting the context
  this._ctx = this._canvasEl.getContext('2d');
}


Display.prototype.clearDisplay = function() {
  this._ctx.clearRect(0,0,this._canvasEl.width, this._canvasEl.height);
}


Display.prototype.drawShape = function(shape, useDisplayOrigin){
  var tiles = shape._tiles,
      origin,
      ctx = this._ctx;

  if (useDisplayOrigin){ 
    origin = this._drawingOrigin;
  } else {
    origin = shape._origin;
  }

  ctx.fillStyle = shape._color;

  for (var i = 0; i < tiles.length; i++) {
    ctx.fillRect(
      origin.x + tiles[i].x*this._tileRatio,
      origin.y + tiles[i].y*this._tileRatio,
      this._tileRatio,
      this._tileRatio);

    var tileStartX  = origin.x + tiles[i].x*this._tileRatio;
    var tileStartY  = origin.y + tiles[i].y*this._tileRatio;

    ctx.strokeStyle='white';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(tileStartX, tileStartY);
    ctx.lineTo(tileStartX+this._tileRatio, tileStartY);
    ctx.lineTo(tileStartX+this._tileRatio, tileStartY+this._tileRatio);
    ctx.lineTo(tileStartX+this._tileRatio, tileStartY+this._tileRatio);
    ctx.lineTo(tileStartX, tileStartY+this._tileRatio);
    ctx.closePath();
    ctx.stroke();

  }

}


Display.prototype.drawShapes = function(shapes){
    for(var i = 0; i < shapes.length; i++) {
      this.drawShape(shapes[i]);
    }
}

module.exports = Display;
},{}],3:[function(require,module,exports){
function Shape(origin, tileRatio) {
  var allShapes = [
  {
    type:  'line',
    color: 'blue',
    tiles: [{x:1, y:0}, {x:1, y:1},{x:1, y:2},{x:1, y:3}]
  },
  {
    type:  'square',
    color: 'green',
    tiles: [{x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:0, y:1}]
  },
  {
    type:  'plus',
    color: 'red',
    tiles: [{x:1, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}]
  },
  {
    type:  'rightL',
    color: 'yellow',
    tiles: [{x:1, y:0}, {x:1, y:1}, {x:1, y:2}, {x:2, y:2}]
  },
  {
    type:  'leftL',
    color: 'orange',
    tiles: [{x:1, y:0}, {x:1, y:1}, {x:1, y:2}, {x:0, y:2}]
  },
  {
    type:  'rightS',
    color: 'gray',
    tiles: [{x:0, y:0}, {x:0, y:1}, {x:1, y:1}, {x:1, y:2}]
  },
  {
    type:  'leftS',
    color: 'black',
    tiles: [{x:1, y:0}, {x:1, y:1}, {x:0, y:1}, {x:0, y:2}]
  }];

  var randomShape = allShapes[allShapes.length * Math.random() << 0];
  this._color = randomShape.color;
  this._tiles = JSON.parse(JSON.stringify(randomShape.tiles));
  this._isDropping = false;
  this._isLanding = false;
  this._isAnimating = false;
  this._origin = origin || {x: 0, y: 0};
  
  if(tileRatio){ //make Y the same so it'll fit nicely when emerges from the top
    var topY;
    this._tiles.forEach(function(tile){
      if(!topY || topY < tile.y) {
        topY = tile.y;
      }
    });
    this._origin.y = ((3-topY)*tileRatio + 4*-tileRatio);
    console.log(this._origin.y);
  }

}

Shape.prototype.getRotationTiles = function () {
    var tiles = [];
    for (var i = 0; i < this._tiles.length; i++) {
      var tilex = this._tiles[i].x;
      var tiley = this._tiles[i].y;
      tiles[i] = {};
      tiles[i].x = 2 - tiley;
      tiles[i].y = tilex;
      //x2 = px + (x1-px)*cos(q)-(y1-py)*sin(q);
      //y2 = py + (x1-px)*sin(q)+(y1-py)*cos(q);
    }
    return tiles;
}

module.exports = Shape;
},{}]},{},[1])


//# sourceMappingURL=bundle.js.map
