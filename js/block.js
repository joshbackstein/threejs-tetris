"use strict";

/* Block Object.
 */
var Block = function(blockType = 0, blockNumber = 0, x = 0, y = BOARD_HEIGHT - 1, z = 0) {
  // Make sure we're using a valid block.
  if (blockType < 0 || blockType >= blocks.length) {
    // It's not a valid block, so default to the first one.
    blockType = 0;
  }

  // Which block do we need?
  var block = blocks[blockType];

  // Copy the block's properties to this object.
  this.color = block.color;
  this.depth = block.depth;
  this.height = block.height;
  this.width = block.width;
  this.grid = block.grid;
  this.xStart = x;
  this.yStart = y;
  this.zStart = z;
  this.xEnd = x + block.width - 1;
  this.yEnd = y + block.height - 1;
  this.zEnd = z + block.depth - 1;
  this.blockNumber = blockNumber;

  // We need to correct for the height of the block.
  if (TESTING) {
    this.yStart = this.height - 1;
    this.yEnd = this.yStart + this.height - 1;
  }
};

/* Prototype functions.
 */
Block.prototype = {
  constructor: Block,

  shiftX: function(offset = 1) {
    // Actually update the block's position in the scene
    // and on the board.
    if (this.checkNewPosition(offset, 0, 0)) {
      this.updatePosition(offset, 0, 0);
    }
  },

  shiftY: function(offset = 1) {
    // Actually update the block's position in the scene
    // and on the board.
    if (this.checkNewPosition(0, offset, 0)) {
      this.updatePosition(0, offset, 0);
    }
  },

  shiftZ: function(offset = 1) {
    // Actually update the block's position in the scene
    // and on the board.
    if (this.checkNewPosition(0, 0, offset)) {
      this.updatePosition(0, 0, offset);
    }
  },

  rotateX: function(offset = 1) {
    // TODO: Add code.
  },

  rotateY: function(offset = 1) {
    // TODO: Add code.
  },

  rotateZ: function(offset = 1) {
    // TODO: Add code.
  },

  checkNewPosition: function(xOffset = 0, yOffset = 0, zOffset = 0) {
    // Set flag to let us know if the new position will work.
    var positionIsOpen = true;

    // Loop through the grid.
    for (var iZ = 0; iZ < this.grid.length; iZ++) {
      for (var iY = 0; iY < this.grid[iZ].length; iY++) {
        for (var iX = 0; iX < this.grid[iZ][iY].length; iX++) {
          var bX = this.xStart + iX + xOffset;
          var bY = this.yStart - iY + yOffset;
          var bZ = this.zStart + iZ + zOffset;

          // If there is a collision, position is not open.
          if (this.grid[iZ][iY][iX] == 1
            && this.parent.checkCollision(bX, bY, bZ, this.blockNumber)
            )
          {
            positionIsOpen = false;
          }
        }
      }
    }

    // Return the result.
    return positionIsOpen;
  },

  updatePosition: function(xOffset = 0, yOffset = 0, zOffset =0) {
    // We'll remove it from the board, apply the offsets, then add it again.
    this.removeFromBoard();
    this.xStart += xOffset;
    this.xEnd += xOffset;
    this.yStart += yOffset;
    this.yEnd += yOffset;
    this.zStart += zOffset;
    this.zEnd += zOffset;
    this.addToBoard();
  },

  removeFromBoard: function() {
    // Loop through the board and remove the block.
    for (var y = 0; y < BOARD_HEIGHT; y++) {
      for (var z = 0; z < BOARD_SIZE; z++) {
        for (var x = 0; x < BOARD_SIZE; x++) {
          if (this.parent.grid[y][z][x].blockNumber == this.blockNumber) {
            this.parent.removeCube(x, y, z);
          }
        }
      }
    }
  },

  addToBoard: function() {
    // Start drawing cubes for the block.
    for (var iZ = 0; iZ < this.grid.length; iZ++) {
      for (var iY = 0; iY < this.grid[iZ].length; iY++) {
        for (var iX = 0; iX < this.grid[iZ][iY].length; iX++) {
          if (this.grid[iZ][iY][iX] == 1) {
            var bX = this.xStart + iX;
            var bY = this.yStart - iY;
            var bZ = this.zStart + iZ;

            this.parent.addCube(bX, bY, bZ, this.color, this.blockNumber);
          }
        }
      }
    }
    if (CORNER_CUBES) {
      var x = this.x;
      var y = this.y;
      var z = this.z;
      addCube(x, y, z, 0xffffff);
      addCube(x + this.width - 1, y, z, 0xffffff);
      addCube(x, y - this.height + 1, z, 0xffffff);
      addCube(x + this.width - 1, y - this.height + 1, z, 0xffffff);
      addCube(x, y, z + this.depth, 0xffffff);
      addCube(x + this.width - 1, y, z + this.depth - 1, 0xffffff);
      addCube(x, y - this.height + 1, z + this.depth - 1, 0xffffff);
      addCube(x + this.width - 1, y - this.height + 1, z + this.depth - 1, 0xffffff);
    }
  }
};
