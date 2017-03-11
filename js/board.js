"use strict";

/* Board Object.
 */
var Board = function(size, height) {
  // Create grid for the board and fill it with zeros.
  this.grid = [];
  for (var y = 0; y < height; y++) {
    // Create layer to add to the board.
    var layer = [];

    // Add rows along z-axis to layer.
    for (var z = 0; z < size; z++) {
      // Create row to add to the layer.
      var row = [];

      // Add columns along x-axis to row.
      for (var x = 0; x < size; x++) {
        // Add empty cell.
        row.push(0);
      }

      // Add row to the layer.
      layer.push(row);
    }

    // Add layer to board.
    this.grid.push(layer);
  }

  // We need a way to keep track of the current block.
  this.blockCounter = 0;
};

/* Prototype functions.
 */
Board.prototype = {
  constructor: Board,

  clear: function() {
    // Board goes by layers, then rows along z-axis, then
    // columns along x-axis.
    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          // Remove cube from scene and grid.
          this.parent.remove(this.grid[y][z][x].cube);
          this.parent.remove(this.grid[y][z][x].cubeOutline);
          this.grid[y][z][x] = 0;
        }
      }
    }
  },

  setBoard: function(i = 0) {
    // Make sure we're using a valid board.
    if (i < 0 || i >= boards.length) {
      // It's not a valid board, so default to the first one.
      i = 0;
    }

    // Let us know what board we're using.
    console.log("Setting board: %d", i + 1);

    // Clear the board before we add stuff to it.
    this.clear();
    this.blockCounter = 0;

    // Loop through the board array and add each cube to the board.
    for (var z = 0; z < boards[i].length; z++) {
      for (var x = 0; x < boards[i][z].length; x++) {
        if (boards[i][z][x] != 0) {
          this.grid[0][z][x] = this.addCube(x, 0, z, 0x888888);
        }
      }
    }
    this.blockCounter += 1;
  },

  addBlock: function(blockType = 1, x = 0, y = BOARD_HEIGHT - 1, z = 0) {
    this.block = new Block(blockType, this.blockCounter, x, y, z);
    Object.defineProperty(this.block, "parent", {value: this});
    this.block.addToBoard(board);
    this.blockCounter += 1;
  },

  addCube: function(x = 0, y = 0, z = 0, color = 0xffffff, blockNumber = this.blockCounter, attachments = {}) {
    if (!this.checkCollision(x, y, z, blockNumber)) {
      // Create cube, then add it to the board and the scene.
      var cube = new Cube(x, y, z, color, blockNumber, attachments);
      Object.defineProperty(cube, "parent", {value: this});
      this.grid[y][z][x] = cube;
      cube.addToScene(this.parent);
      return cube;
    } else {
      // There was a collision, so return null to indicate that.
      return null;
    }
  },

  removeCube: function(x = 0, y = 0, z = 0) {
    if (this.grid[y][z][x] != 0) {
      // Check if this cube has any attachments so we can remove
      // the association.
      var cube = this.grid[y][z][x];
      if (cube.attachments.xPos == true) {
        this.grid[y][z][x + 1].attachments.xNeg = false;
      }
      if (cube.attachments.xNeg == true) {
        this.grid[y][z][x - 1].attachments.xPos = false;
      }
      if (cube.attachments.yPos == true) {
        this.grid[y + 1][z][x].attachments.yNeg = false;
      }
      if (cube.attachments.yNeg == true) {
        this.grid[y - 1][z][x].attachments.yPos = false;
      }
      if (cube.attachments.zPos == true) {
        this.grid[y][z + 1][x].attachments.zNeg = false;
      }
      if (cube.attachments.zNeg == true) {
        this.grid[y][z - 1][x].attachments.zPos = false;
      }

      // Remove it from the scene and the board.
      this.parent.remove(cube.cube);
      this.parent.remove(cube.cubeOutline);
      this.grid[y][z][x] = 0;
    }
  },

  // Check for collisions.
  checkCollision: function(x, y, z, blockNumber) {
    if (y >= this.grid.length
      || y < 0
      || z >= this.grid[y].length
      || z < 0
      || x >= this.grid[y][z].length
      || x < 0
      )
    {
      // Collision.
      return true;
    } else {
      if (this.grid[y][z][x] != 0
        && this.grid[y][z][x].blockNumber != blockNumber
        )
      {
        // Collision.
        return true;
      } else {
        // No collision.
        return false;
      }
    }
  },

  addToScene: function(scene) {
    // Loop through the board and add all the cubes.
    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] != 0) {
            this.grid[y][z][x].addToScene(this.parent);
          }
        }
      }
    }
  },

  // Check each layer of the board for completion and remove any
  // completed layers.
  checkLayers: function() {
    // Flag to let us know if any layers were completed.
    var someLayerComplete = false;

    // Check each layer for completion.
    for (var y = 0; y < this.grid.length; y++) {
      // Flag to let us know if this layer was completed.
      var thisLayerComplete = true;
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] == 0) {
            thisLayerComplete = false;
          }
        }
      }

      // Was the layer complete?
      if (thisLayerComplete) {
        // It was, so set the flag and remove all the blocks
        // in that layer and advance the layers.
        someLayerComplete = true;
        for (var z = 0; z < this.grid[y].length; z++) {
          for (var x = 0; x < this.grid[y][z].length; x++) {
            // We don't want to remove permanent cubes from the level.
            if (this.grid[y][z][x].blockNumber != 0) {
              this.removeCube(x, y, z);
            }
          }
        }
      }
    }

    // Return the result.
    return someLayerComplete;
  },

  // Advance each layer of the board so we can check if any
  // layers are completed again.
  advanceLayers: function() {
    // TODO: Add code.
  },

  // Advance the block.
  advance: function() {
    // Advance the block.
    if (BLOCK_DROP_SKIP) {
      this.block.shiftY(-10);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
      this.block.shiftY(-1);
    }
    this.block.shiftY(-1);

    // Check for layer completions and remove any completed layers.
    while (this.checkLayers()) {
      // If any layers were completed, we need to advance
      // the layers before checking them again.
      this.advanceLayers();
    }

    // Show us what the board looks like after we've advanced everything.
    console.log(this);
  }
};
