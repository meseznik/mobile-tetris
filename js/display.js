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

