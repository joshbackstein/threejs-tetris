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

  // By default, the game will not play the music because we
  // want to wait until the player starts the game to play
  // the music.
  this.playMusic = false;

  // We also want to keep track of which board we're using
  // so we can easily reset it.
  this.boardType = DEFAULT_BOARD;

  // We need to keep track of whether or not this board has
  // a floor.
  this.floor = null;
  this.hasFloor = false;

  // We need a way to keep track of the current block.
  this.block = null;
  this.blockCounter = 0;
};

/* Prototype functions.
 */
Board.prototype = {
  constructor: Board,

  addFloor: function() {
    // Only add the floor if we don't have one yet.
    if (!this.hasFloor) {
      // Set flag.
      this.hasFloor = true;

      // Add floor of board to the board and scene.
      var floorSize = BOARD_SIZE * CUBE_SIZE;
      var floorGeometry = new THREE.PlaneBufferGeometry(floorSize, floorSize, 1, 1);
      var floorMaterial;
      if (this.ADD_FLOOR_TEXTURE) {
        floorMaterial = new THREE.MeshPhongMaterial({
          map: this.floorTexture,
          side: THREE.DoubleSide
        });
      } else {
        floorMaterial = new THREE.MeshPhongMaterial({
          color: 0x444444,
          side: THREE.DoubleSide
        });
      }
      this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
      this.parent.scene.add(this.floor);
      this.floor.rotateX(-Math.PI / 2);
    }
  },

  clear: function() {
    // Board goes by layers, then rows along z-axis, then
    // columns along x-axis.
    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          // Remove cube from scene and grid.
          this.parent.scene.remove(this.grid[y][z][x].cube);
          this.parent.scene.remove(this.grid[y][z][x].cubeOutline);
          this.grid[y][z][x] = 0;
        }
      }
    }

    // Remove the current block.
    this.block = null;
  },

  setBoard: function(i = 0) {
    // Make sure we're using a valid board.
    if (i < 0 || i >= boards.length) {
      // It's not a valid board, so default to the first one.
      i = 0;
    }

    // Store the board we're using.
    this.boardType = i;

    // Let us know what board we're using.
    console.log("Setting board: %d", i + 1);

    // Clear the board before we add stuff to it and reset other
    // properties.
    this.clear();
    this.block = null;
    this.blockCounter = 0;
    this.isBlank = true;

    // Loop through the board array and add each cube to the board.
    for (var z = 0; z < boards[i].length; z++) {
      for (var x = 0; x < boards[i][z].length; x++) {
        if (boards[i][z][x] != 0) {
          this.grid[0][z][x] = this.addCube(x, 0, z, 0x888888);
          this.isBlank = false;
        }
      }
    }
    this.blockCounter += 1;
  },

  // Reset the board using the current board we're set to.
  reset: function() {
    this.setBoard(this.boardType);
  },

  addBlock: function(blockType = 1, x = 0, y = BOARD_HEIGHT - 1, z = 0) {
    this.block = new Block(blockType, this.blockCounter, x, y, z);
    Object.defineProperty(this.block, "parent", {value: this});
    this.block.addToBoard(this);
    this.blockCounter += 1;
  },

  addRandomBlock: function() {
    if (this.parent.debugMode) {
      this.addBlock(0);
    } else {
      var blockType = Math.floor(Math.random() * blocks.length);
      this.addBlock(blockType);
    }
  },

  addCube: function(
    x = 0
    , y = 0
    , z = 0
    , color = 0xffffff
    , blockNumber = this.blockCounter
    , attachments = {}
    )
  {
    if (!this.checkCollision(x, y, z, blockNumber)) {
      // Create cube, then add it to the board and the scene.
      var cube = new Cube(x, y, z, color, blockNumber, attachments);
      Object.defineProperty(cube, "parent", {value: this});
      cube.updateTexture();
      this.grid[y][z][x] = cube;
      cube.addToScene(this.parent.scene);
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
      this.parent.scene.remove(cube.cube);
      this.parent.scene.remove(cube.cubeOutline);
      this.grid[y][z][x] = 0;
    }
  },

  // Shift block in X direction.
  shiftBlockX: function(offset = 1) {
    this.block.shiftX(offset);
  },

  // Shift block in Y direction.
  shiftBlockY: function(offset = 1) {
    this.block.shiftY(offset);
  },

  // Shift block in Z direction.
  shiftBlockZ: function(offset = 1) {
    this.block.shiftZ(offset);
  },

  // Rotate block about X-axis.
  rotateBlockX: function() {
    this.block.rotateX();
  },

  // Rotate block about Y-axis.
  rotateBlockY: function() {
    this.block.rotateY();
  },

  // Rotate block about Z-axis.
  rotateBlockZ: function() {
    this.block.rotateZ();
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
      // Invalid location, so return a collision.
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
            this.grid[y][z][x].addToScene(this.parent.scene);
          }
        }
      }
    }
  },

  // Check each layer of the board for completion and remove any
  // completed layers.
  checkLayers: function() {
    // Array to let us know what layers were completed.
    var layersComplete = [];

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
        // It was, so add the layer to the array and remove all the
        // blocks in that layer.
        layersComplete.push(y);
        for (var z = 0; z < this.grid[y].length; z++) {
          for (var x = 0; x < this.grid[y][z].length; x++) {
            // We don't want to remove permanent cubes from the level.
            if (this.grid[y][z][x].blockNumber != 0) {
              this.removeCube(x, y, z);
            }
          }
        }

        // Whenever a layer is completed, we also want to increment the
        // game's level counter.
        this.parent.incrementLevelCounter();
      }
    }

    // Return the result.
    return layersComplete;
  },

  // We need to check if a cube can actually fall.
  cubeCanFall: function(x, y, z, checked = []) {
    // Make it easier to reference the cube.
    var cube = this.grid[y][z][x];
    checked.push(cube.getId());

    // Make sure this isn't an empty space, already on the bottom
    // row, or outside the bounds of the grid.
    if (y <= 0 || y >= this.grid.length
      || z < 0 || z >= this.grid[y].length
      || x < 0 || x >= this.grid[y][z].length
      || this.grid[y][z][x] == 0
      )
    {
      // A cube can't fall if it's already on the bottom or doesn't
      // exist.
      return false;
    }

    // If we've made it this far, the cube exists. If a cube is
    // above another cube it is not attached to, it cannot fall,
    // so none of the cubes attached to it can fall either.
    var canFall = true;
    if (this.checkCollision(x, y - 1, z, cube.blockNumber)) {
      canFall = false;
    }

    // If we've gotten to this point, the cube has an open space
    // below it, so we need to make sure it's not attached to any
    // other cubes. We also don't want to check the previous cube.
    if (cube.attachments.xPos == true) {
      // Have we checked this one yet?
      var xPos = this.grid[y][z][x + 1];
      if (xPos != 0 && checked.indexOf(xPos.getId()) < 0) {
        // If the attached cube can't fall, this one can't fall
        // either.
        if (!this.cubeCanFall(x + 1, y, z, checked)) {
          canFall = false;
        }
      }
    }
    if (cube.attachments.xNeg == true) {
      // Have we checked this one yet?
      var xNeg = this.grid[y][z][x - 1];
      if (xNeg != 0 && checked.indexOf(xNeg.getId()) < 0) {
        // If the attached cube can't fall, this one can't fall
        // either.
        if (!this.cubeCanFall(x - 1, y, z, checked)) {
          canFall = false;
        }
      }
    }
    if (cube.attachments.yPos == true) {
      // Have we checked this one yet?
      var yPos = this.grid[y + 1][z][x];
      if (yPos != 0 && checked.indexOf(yPos.getId()) < 0) {
        // If the attached cube can't fall, this one can't fall
        // either.
        if (!this.cubeCanFall(x, y + 1, z, checked)) {
          canFall = false;
        }
      }
    }
    if (cube.attachments.yNeg == true) {
      // Have we checked this one yet?
      var yNeg = this.grid[y - 1][z][x];
      if (yNeg != 0 && checked.indexOf(yNeg.getId()) < 0) {
        // If the attached cube can't fall, this one can't fall
        // either.
        if (!this.cubeCanFall(x, y - 1, z, checked)) {
          canFall = false;
        }
      }
    }
    if (cube.attachments.zPos == true) {
      // Have we checked this one yet?
      var zPos = this.grid[y][z + 1][x];
      if (zPos != 0 && checked.indexOf(zPos.getId()) < 0) {
        // If the attached cube can't fall, this one can't fall
        // either.
        if (!this.cubeCanFall(x, y, z + 1, checked)) {
          canFall = false;
        }
      }
    }
    if (cube.attachments.zNeg == true) {
      // Have we checked this one yet?
      var zNeg = this.grid[y][z - 1][x];
      if (zNeg != 0 && checked.indexOf(zNeg.getId()) < 0) {
        // If the attached cube can't fall, this one can't fall
        // either.
        if (!this.cubeCanFall(x, y, z - 1, checked)) {
          canFall = false;
        }
      }
    }

    // If we've made it this far, the cube can fall.
    return canFall;
  },

  // Advance each layer of the board so we can check if any
  // layers are completed again.
  advanceLayers: function(layersComplete = []) {
    // Loop through the completed layers.
    for (var i = 0; i < layersComplete.length; i++) {
      // If the bottom layer was cleared, we only want to shift things
      // down to it if we're using a blank board. For any layers above
      // that, we want to shift things down to them.
      if ((layersComplete[i] == 0 && this.isBlank)
        || layersComplete[i] > 0
        )
      {
        var y = layersComplete[i] + 1;
        y -= i;

        for (; y < this.grid.length; y++) {
          for (var z = 0; z < this.grid[y].length; z++) {
            for (var x = 0; x < this.grid[y][z].length; x++) {
              if (this.grid[y][z][x] != 0) {
                this.grid[y][z][x].addY(-1);
                this.grid[y - 1][z][x] = this.grid[y][z][x];
                this.grid[y][z][x] = 0;
              }
            }
          }
        }
      }
    }

    // Loop through the rest of the layers. The bottom layer can't fall,
    // so we'll start at the one right above it.
    for (var y = 1; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] != 0) {
            if (this.cubeCanFall(x, y, z)) {
              this.grid[y][z][x].addY(-1);
              this.grid[y - 1][z][x] = this.grid[y][z][x];
              this.grid[y][z][x] = 0;
            }
          }
        }
      }
    }
  },

  // Advance the game.
  advance: function() {
    // If we don't have a block, add one.
    if (this.block == null) {
      this.addRandomBlock();
    }

    // Advance the block.
    var blockStopped = !this.block.shiftY(-1);

    // We only want to check the layers when the block has stopped dropping.
    if (blockStopped) {
      // Check for layer completions and remove any completed layers.
      var layersComplete = this.checkLayers();
      while (layersComplete.length > 0) {
        // If any layers were completed, we need to advance
        // the layers before checking them again.
        this.advanceLayers(layersComplete);
        layersComplete = this.checkLayers();
      }

      // We need to drop a new block.
      this.addRandomBlock();

      // Show us what the board looks like after we've advanced everything.
      console.log(this);
    }
  }
};
