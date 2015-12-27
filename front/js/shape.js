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