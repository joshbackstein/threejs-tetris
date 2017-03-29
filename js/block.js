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
  this.size = block.size;
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
      // Shift.
      this.updatePosition(offset, 0, 0);
      return true;
    } else {
      // Don't shift.
      return false;
    }
  },

  shiftY: function(offset = 1) {
    // Actually update the block's position in the scene
    // and on the board.
    if (this.checkNewPosition(0, offset, 0)) {
      this.updatePosition(0, offset, 0);
      return true;
    } else {
      // Don't shift.
      return false;
    }
  },

  shiftZ: function(offset = 1) {
    // Actually update the block's position in the scene
    // and on the board.
    if (this.checkNewPosition(0, 0, offset)) {
      this.updatePosition(0, 0, offset);
      return true;
    } else {
      // Don't shift.
      return false;
    }
  },

  rotateX: function() {
    // Create new grid to store rotation for this block. The outer
    // array contains each slice along the Z-axis.
    var rotGrid = [];
    for (var z = 0; z < this.grid.length; z++) {
      rotGrid.push([]);
      for (var y = 0; y < this.grid[z].length; y++) {
        rotGrid[z].push([]);
        for (var x = 0; x < this.grid[z][y].length; x++) {
          rotGrid[z][y].push(0);
        }
      }
    }

    // Rotate.
    for (var oZ = 0; oZ < this.grid.length; oZ++) {
      for (var oY = 0; oY < this.grid[oZ].length; oY++) {
        for (var oX = 0; oX < this.grid[oZ][oY].length; oX++) {
          var nX = oX;
          var nY = this.size - 1 - oZ;
          var nZ = oY;

          rotGrid[nZ][nY][nX] = this.grid[oZ][oY][oX];
        }
      }
    }

    // We need to apply the new grid to check it for collisions,
    // so make a backup of the current one.
    var oldGrid = this.grid;
    this.grid = rotGrid;
    if (this.checkNewPosition(0, 0, 0)) {
      // No collsions, so update the position of the block to
      // refresh it on the board and the scene.
      this.updatePosition(0, 0, 0);
    } else {
      // There was at least one collision, so restore the old grid.
      this.grid = oldGrid;
    }
  },

  rotateY: function() {
    // Create new grid to store rotation for this block. The outer
    // array contains each slice along the Z-axis.
    var rotGrid = [];
    for (var z = 0; z < this.grid.length; z++) {
      rotGrid.push([]);
      for (var y = 0; y < this.grid[z].length; y++) {
        rotGrid[z].push([]);
        for (var x = 0; x < this.grid[z][y].length; x++) {
          rotGrid[z][y].push(0);
        }
      }
    }

    // Rotate.
    for (var oZ = 0; oZ < this.grid.length; oZ++) {
      for (var oY = 0; oY < this.grid[oZ].length; oY++) {
        for (var oX = 0; oX < this.grid[oZ][oY].length; oX++) {
          var nX = this.size - 1 - oZ;
          var nY = oY;
          var nZ = oX;

          rotGrid[nZ][nY][nX] = this.grid[oZ][oY][oX];
        }
      }
    }

    // We need to apply the new grid to check it for collisions,
    // so make a backup of the current one.
    var oldGrid = this.grid;
    this.grid = rotGrid;
    if (this.checkNewPosition(0, 0, 0)) {
      // No collsions, so update the position of the block to
      // refresh it on the board and the scene.
      this.updatePosition(0, 0, 0);
    } else {
      // There was at least one collision, so restore the old grid.
      this.grid = oldGrid;
    }
  },

  rotateZ: function() {
    // Create new grid to store rotation for this block. The outer
    // array contains each slice along the Z-axis.
    var rotGrid = [];
    for (var z = 0; z < this.grid.length; z++) {
      rotGrid.push([]);
      for (var y = 0; y < this.grid[z].length; y++) {
        rotGrid[z].push([]);
        for (var x = 0; x < this.grid[z][y].length; x++) {
          rotGrid[z][y].push(0);
        }
      }
    }

    // Rotate.
    for (var oZ = 0; oZ < this.grid.length; oZ++) {
      for (var oY = 0; oY < this.grid[oZ].length; oY++) {
        for (var oX = 0; oX < this.grid[oZ][oY].length; oX++) {
          var nX = this.size - 1 - oY;
          var nY = oX;
          var nZ = oZ;

          rotGrid[nZ][nY][nX] = this.grid[oZ][oY][oX];
        }
      }
    }

    // We need to apply the new grid to check it for collisions,
    // so make a backup of the current one.
    var oldGrid = this.grid;
    this.grid = rotGrid;
    if (this.checkNewPosition(0, 0, 0)) {
      // No collsions, so update the position of the block to
      // refresh it on the board and the scene.
      this.updatePosition(0, 0, 0);
    } else {
      // There was at least one collision, so restore the old grid.
      this.grid = oldGrid;
    }
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
    var cubeCount = 0;
    for (var iZ = 0; iZ < this.grid.length; iZ++) {
      for (var iY = 0; iY < this.grid[iZ].length; iY++) {
        for (var iX = 0; iX < this.grid[iZ][iY].length; iX++) {
          if (this.grid[iZ][iY][iX] == 1) {
            var bX = this.xStart + iX;
            var bY = this.yStart - iY;
            var bZ = this.zStart + iZ;

            // We need to see what blocks this one is connected to.
            var attachments = {
              xPos: false,
              xNeg: false,
              yPos: false,
              yNeg: false,
              zPos: false,
              zNeg: false
            };
            // Is there an attachment in the positive X direction?
            if (iX < this.grid[iZ][iY].length - 1
              && this.grid[iZ][iY][iX + 1] == 1
              )
            {
              attachments.xPos = true;
            }
            // Is there an attachment in the negative X direction?
            if (iX > 0
              && this.grid[iZ][iY][iX - 1] == 1
              )
            {
              attachments.xNeg = true;
            }
            // Is there an attachment in the positive Y direction?
            if (iY > 0
              && this.grid[iZ][iY - 1][iX] == 1
              )
            {
              attachments.yPos = true;
            }
            // Is there an attachment in the negative Y direction?
            if (iY < this.grid[iZ].length - 1
              && this.grid[iZ][iY + 1][iX] == 1
              )
            {
              attachments.yNeg = true;
            }
            // Is there an attachment in the positive Z direction?
            if (iZ < this.grid.length - 1
              && this.grid[iZ + 1][iY][iX] == 1
              )
            {
              attachments.zPos = true;
            }
            // Is there an attachment in the negative Z direction?
            if (iZ > 0
              && this.grid[iZ - 1][iY][iX] == 1
              )
            {
              attachments.zNeg = true;
            }

            // Can the cube be added here, or is another cube in the way?
            var willCollide = this.parent.checkCollision(bX, bY, bZ, this.blockNumber);
            if (willCollide) {
              // If the cube will collide, it can't be placed because a cube
              // is already there. If that happens, we're stacked too high
              // and need to end the game.
              this.parent.parent.endGame();
            } else {
              // We were able to add the cube, so set its ID.
              var cube = this.parent.addCube(bX, bY, bZ, this.color,
                this.blockNumber, attachments);
              cube.setId(cubeCount);
              cubeCount++;
            }
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
