"use strict";

/* Game Object.
 */
var Game = function() {
  // Declare some public variables.
  this.scene = null;
  this.camera = null;
  this.board = null;
  this.renderer = null;
  this.geometry = null;
  this.material = null;
  this.mesh = null;

  // We need to be able to access a couple DOM elements.
  this.levelLabel = document.getElementById("level-label");
  this.pointsLabel = document.getElementById("points-label");

  // Initialize some public variables.
  this.cameraRot = 0;
  this.dropThreshold = 80;
  this.dropCounter = 0;

  // Initialize some flags.
  this.initialized = false;
  this.keysAreBound = false;

  // We want to keep track of the score and level. The level
  // counter increases every time a line is cleared, and the
  // level increases every time the counter reaches 3. The
  // speed modifier is changed to 70% of its current value
  // for every two levels that have been reached.
  this.score = 0;
  this.level = 0;
  this.levelCounter = 0;
  this.speedModifier = 1;

  // Debug functions.
  this.debugMode = false;
};

/* Prototype functions.
 */
Game.prototype = {
  constructor: Game,

  // Initialize the game.
  init: function() {
    // Set the flag.
    this.initialized = true;

    // Create the main scene for the 3D drawing
    this.scene = new THREE.Scene();

    // Every scene needs a camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.y = CAMERA_Y;
    this.camera.position.x = Math.sin(this.cameraRot) * CAMERA_X;
    this.camera.position.z = Math.cos(this.cameraRot) * CAMERA_Z;
    this.camera.lookAt(new THREE.Vector3(CAMERA_POINT_X, CAMERA_POINT_Y, CAMERA_POINT_Z));

    // Add light to the scene.
    var ambientLight = new THREE.AmbientLight(0xf0f0f0);
    this.scene.add(ambientLight);
    // TODO: Add point lights.

    // Add sky box to the scene.
    var skyBoxGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({
      color: 0x42c0fb,
      side: THREE.BackSide
    });
    var skyBoxMesh = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    this.scene.add(skyBoxMesh);

    // Initialize board, then add it to the scene. We'll use the first
    // board by default.
    this.board = new Board(BOARD_SIZE, BOARD_HEIGHT);
    this.board = Object.defineProperty(this.board, "parent", {value: this});
    this.board.setBoard(DEFAULT_BOARD);
    this.board.addFloor();

    // Load external resources for the game, such as audio and textures.
    this.loadExternalResources();

    // Add grid helper to the scene.
    if (ADD_GRID_HELPER) {
      var gridSize = BOARD_SIZE * CUBE_SIZE;
      var gridDivisions = BOARD_SIZE;
      var gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
      this.scene.add(gridHelper);
    }

    // Add axis helper to the scene.
    if (ADD_AXIS_HELPER) {
      var axisLength = (BOARD_SIZE * CUBE_SIZE) / 2;
      var axisHelper = new THREE.AxisHelper(axisLength);
      this.scene.add(axisHelper);
    }

    // The renderer renders the scene using the objects, lights and camera.
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Add key listener.
    if (!this.keysAreBound) {
      // Set flag.
      this.keysAreBound = true;

      // Add key listener.
      var thisGame = this;
      document.addEventListener("keydown", function(e) {
        console.log("keydown:", e.key);
        if (e.key == "ArrowUp" || e.key == "k" || e.key == "K") {
          if (!thisGame.paused) {
            thisGame.shiftBlockUp();
          }
        }
        if (e.key == "ArrowDown" || e.key == "j" || e.key == "J") {
          if (!thisGame.paused) {
            thisGame.shiftBlockDown();
          }
        }
        if (e.key == "ArrowLeft" || e.key == "h" || e.key == "H") {
          if (!thisGame.paused) {
            thisGame.shiftBlockLeft();
          }
        }
        if (e.key == "ArrowRight" || e.key == "l" || e.key == "L") {
          if (!thisGame.paused) {
            thisGame.shiftBlockRight();
          }
        }
        if (e.key == " ") {
          if (!thisGame.paused) {
            thisGame.dropBlock();
          }
        }
        if (e.key == "s" || e.key == "S") {
          if (!thisGame.paused) {
            thisGame.rotateBlockX();
          }
        }
        if (e.key == "d" || e.key == "D") {
          if (!thisGame.paused) {
            thisGame.rotateBlockY();
          }
        }
        if (e.key == "f" || e.key == "F") {
          if (!thisGame.paused) {
            thisGame.rotateBlockZ();
          }
        }
        if (e.key == "q" || e.key == "Q") {
          thisGame.togglePause();
        }
        if (e.key == "w" || e.key == "W") {
          thisGame.toggleMusic();
        }
        if (e.key == "e" || e.key == "E") {
          if (!thisGame.paused) {
            thisGame.rotateCamera(-ROTATION_AMOUNT);
          }
        }
        if (e.key == "r" || e.key == "R") {
          if (!thisGame.paused) {
            thisGame.rotateCamera(ROTATION_AMOUNT);
          }
        }
        // TODO: Remove this.
        if (e.key == "Escape") {
          // Kill the game.
          thisGame.board.clear();
          thisGame.endGame();
        }
      });
    }

    // Attach the threeJS renderer to the HTML page
    document.body.appendChild(this.renderer.domElement);
  },

  // Move block up.
  shiftBlockUp: function() {
    // The block needs to be shifted the correct direction based on
    // the angle.
    if (this.cameraRot >= Math.PI / 4 && this.cameraRot < (3 * Math.PI) / 4) {
      // Pi / 4 <= x < 3Pi / 4
      this.board.shiftBlockX(-1);
    } else if (this.cameraRot >= (3 * Math.PI) / 4 && this.cameraRot < (5 * Math.PI) / 4) {
      // 3Pi / 4 <= x < 5Pi / 4
      this.board.shiftBlockZ(1);
    } else if (this.cameraRot >= (5 * Math.PI) / 4 && this.cameraRot < (7 * Math.PI) / 4) {
      // 5Pi / 4 <= x < 7Pi / 4
      this.board.shiftBlockX(1);
    } else {
      // -Pi / 4 <= x < Pi / 4
      this.board.shiftBlockZ(-1);
    }
  },

  // Move block down.
  shiftBlockDown: function() {
    // The block needs to be shifted the correct direction based on
    // the angle.
    if (this.cameraRot >= Math.PI / 4 && this.cameraRot < (3 * Math.PI) / 4) {
      // Pi / 4 <= x < 3Pi / 4
      this.board.shiftBlockX(1);
    } else if (this.cameraRot >= (3 * Math.PI) / 4 && this.cameraRot < (5 * Math.PI) / 4) {
      // 3Pi / 4 <= x < 5Pi / 4
      this.board.shiftBlockZ(-1);
    } else if (this.cameraRot >= (5 * Math.PI) / 4 && this.cameraRot < (7 * Math.PI) / 4) {
      // 5Pi / 4 <= x < 7Pi / 4
      this.board.shiftBlockX(-1);
    } else {
      // -Pi / 4 <= x < Pi / 4
      this.board.shiftBlockZ(1);
    }
  },

  // Move block left.
  shiftBlockLeft: function() {
    // The block needs to be shifted the correct direction based on
    // the angle.
    if (this.cameraRot >= Math.PI / 4 && this.cameraRot < (3 * Math.PI) / 4) {
      // Pi / 4 <= x < 3Pi / 4
      this.board.shiftBlockZ(1);
    } else if (this.cameraRot >= (3 * Math.PI) / 4 && this.cameraRot < (5 * Math.PI) / 4) {
      // 3Pi / 4 <= x < 5Pi / 4
      this.board.shiftBlockX(1);
    } else if (this.cameraRot >= (5 * Math.PI) / 4 && this.cameraRot < (7 * Math.PI) / 4) {
      // 5Pi / 4 <= x < 7Pi / 4
      this.board.shiftBlockZ(-1);
    } else {
      // -Pi / 4 <= x < Pi / 4
      this.board.shiftBlockX(-1);
    }
  },

  // Move block right.
  shiftBlockRight: function() {
    // The block needs to be shifted the correct direction based on
    // the angle.
    if (this.cameraRot >= Math.PI / 4 && this.cameraRot < (3 * Math.PI) / 4) {
      // Pi / 4 <= x < 3Pi / 4
      this.board.shiftBlockZ(-1);
    } else if (this.cameraRot >= (3 * Math.PI) / 4 && this.cameraRot < (5 * Math.PI) / 4) {
      // 3Pi / 4 <= x < 5Pi / 4
      this.board.shiftBlockX(-1);
    } else if (this.cameraRot >= (5 * Math.PI) / 4 && this.cameraRot < (7 * Math.PI) / 4) {
      // 5Pi / 4 <= x < 7Pi / 4
      this.board.shiftBlockZ(1);
    } else {
      // -Pi / 4 <= x < Pi / 4
      this.board.shiftBlockX(1);
    }
  },

  // Drop block one level.
  dropBlock: function() {
    this.dropCounter = this.dropThreshold;
  },

  // Rotate block about x-axis.
  rotateBlockX: function() {
    this.board.rotateBlockX();
  },

  // Rotate block about y-axis.
  rotateBlockY: function() {
    this.board.rotateBlockY();
  },

  // Rotate block about z-axis.
  rotateBlockZ: function() {
    this.board.rotateBlockZ();
  },

  // Rotate the camera. We want to keep the angle at a value from 0
  // to 2Pi.
  rotateCamera: function(rotationAmount) {
    // Rotate the camera.
    this.cameraRot += rotationAmount;

    // Make sure we're within the range.
    if (this.cameraRot < 0) {
      this.cameraRot += 2 * Math.PI;
    }
    if (this.cameraRot > 2 * Math.PI) {
      this.cameraRot -= 2 * Math.PI;
    }
  },

  // Load external resources.
  loadExternalResources: function() {
    // We need a reference to this game for the loader callback
    // functions.
    var thisGame = this;

    // We only want to let the game run after everything has
    // been loaded or had an error loading.
    var loadingManagerCallback = function() {
      // TODO Change this to progress to the game after reaching it.
      thisGame.keepPlaying = true;
      thisGame.paused = false;
    };

    THREE.DefaultLoadingManager.onLoad = loadingManagerCallback;
    THREE.DefaultLoadingManager.onError = loadingManagerCallback;
    // Attempt to load music. To do this, we need to create a listener
    // and add it to the camera, then we need to create a global audio
    // source.
    var listener = new THREE.AudioListener();
    this.camera.add(listener);
    this.sound = new THREE.Audio(listener);
    this.audioLoader = new THREE.AudioLoader();
    this.audioLoader.load(
      // Path to music.
      "audio/theme.mp3",

      // Function to run upon load completion.
      function(buffer) {
        // Set flags and sound.
        thisGame.ADD_MUSIC = true;
        thisGame.sound.setBuffer(buffer);
        thisGame.sound.setLoop(true);
        thisGame.sound.setVolume(0.5);
      }
    );

    // Attempt to load a texture for the floor.
    this.board.ADD_FLOOR_TEXTURE = false;
    this.board.floorLoader = new THREE.TextureLoader();
    this.board.floorLoader.load(
      // Path to texture.
      FLOOR_TEXTURE_PATH,

      // Function to run upon load completion.
      function(texture) {
        // Set flags and texture.
        thisGame.board.ADD_FLOOR_TEXTURE = true;
        thisGame.board.floorTexture = texture;

        // If the board has a floor, we want to update its material
        // with the new texture.
        if (thisGame.board.hasFloor) {
          var floorMaterial = new THREE.MeshPhongMaterial({
            map: thisGame.board.floorTexture,
            side: THREE.DoubleSide
          });
          thisGame.board.floor.material = floorMaterial;
        }
      }
    );

    // Attempt to load a texture for the cubes.
    this.board.ADD_CUBE_TEXTURE = false;
    this.board.cubeLoader = new THREE.TextureLoader();
    this.board.cubeLoader.load(
      // Path to texture.
      CUBE_TEXTURE_PATH,

      // Function to run upon load completion.
      function(texture) {
        // Set flags and texture.
        thisGame.board.ADD_CUBE_TEXTURE = true;
        thisGame.board.cubeTexture = texture;
      }
    );
  },

  // Run the game.
  run: function() {
    // If the game isn't initialized yet, initialize it.
    if (!this.initialized) {
      this.init();
    }

    // Start the game/animation loop.
    this.animate();
  },

  // Start the game.
  startGame: function() {
    this.keepPlaying = true;
    this.paused = false;

    // Reset everything.
    this.score = 0;
    this.level = 0;
    this.levelCounter = 0;
    this.speedModifier = 1;
    this.sound.setPlaybackRate(1);
  },

  // End the game.
  endGame: function() {
    // This will get called multiple times if multiple cubes collide
    // when adding a new block, so we will only od this stuff for the
    // first collision.
    if (this.keepPlaying) {
      // Set flag.
      this.keepPlaying = false;
      this.paused = true;

      // Let us know the game has ended.
      console.log("Game over!");

      // TODO: Display game over message and add menu to restart game.
    }
  },

  // Pause or unpause the game.
  togglePause: function() {
    // Toggle the pause flag.
    this.paused = !this.paused;

    // TODO: Display paused message on the screen.
  },

  // Play or pause the music.
  toggleMusic: function() {
    // Play or pause the music based on the playMusic flag.
    if (this.playMusic) {
      // Toggle the flag.
      this.playMusic = false;

      // Pause the music.
      this.sound.pause();
    } else {
      // Toggle the flag.
      this.playMusic = true;

      // Play the music.
      this.sound.play();
    }
  },

  // Toggle debug mode.
  toggleDebugMode: function() {
    if (this.debugMode) {
      this.debugMode = false;

      this.board.setBoard(DEFAULT_BOARD);
    } else {
      this.debugMode = true;

      this.board.setBoard(3);
    }

    this.endGame();
    this.startGame();
  },

  // Increment the level counter. If the counter reaches 3,
  // we will reset it, increase the level and score. The speed
  // of the game is increased every two levels.
  incrementLevelCounter: function() {
    // Increase score.
    this.score += 1000;

    // Increase level counter.
    this.levelCounter++;

    // Do we need to increase the level?
    if (this.levelCounter >= 3) {
      // Reset the counter.
      this.levelCounter = 0;

      // Increase the level.
      this.level++;

      // Do we need to increase the speed?
      if (this.level % 2 == 0 && this.speedModifier > MINIMUM_SPEED_MODIFIER) {
        this.speedModifier *= 0.70;

        // Update the speed of the music.
        if (this.speedModifier < 1) {
          this.sound.setPlaybackRate(this.sound.playbackRate + 0.02);
        }
      }

      // Speed modifier should only get as low as the minimum
      // speed modifer threshold.
      if (this.speedModifier < MINIMUM_SPEED_MODIFIER) {
        this.speedModifier = MINIMUM_SPEED_MODIFIER;
      }
    }

    // TODO: Remove this.
    console.log("Score:", this.score);
    console.log("Level:", this.level);
    console.log("Level Counter:", this.levelCounter);
    console.log("Speed Modifier:", this.speedModifier);
    console.log("Sound Playback Rate:", this.sound.playbackRate);

    // Update the level and points labels.
    this.levelLabel.innerHTML = "Level " + (this.level + 1);
    this.pointsLabel.innerHTML = "Points: " + this.score;
  },

  // This is the game/animation loop
  animate: function() {
    // Get an animation frame to render.
    var thisGame = this;
    requestAnimationFrame(function() {
      thisGame.animate();
    });

    // We only want to animate things if the game hasn't ended
    // and isn't paused.
    if (this.keepPlaying && !this.paused) {
      // Move the camera
      this.camera.position.y = CAMERA_Y;
      this.camera.position.x = Math.sin(this.cameraRot) * CAMERA_X;
      this.camera.position.z = Math.cos(this.cameraRot) * CAMERA_Z;
      this.camera.lookAt(new THREE.Vector3(CAMERA_POINT_X, CAMERA_POINT_Y, CAMERA_POINT_Z));

      // Move the blocks. To do this, we will incrase the drop
      // counter each frame. When it reaches the threshold, the
      // blocks will drop another level.
      this.dropCounter += 1;
      if (this.dropCounter >= Math.floor(this.dropThreshold * this.speedModifier)) {
        // Reset the counter.
        this.dropCounter = 0;

        // Advance the block.
        this.board.advance();
      }
    }

    // Render the scene.
    this.renderer.render(this.scene, this.camera);
  }
};
