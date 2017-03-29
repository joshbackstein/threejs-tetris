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

  // Initialize some public variables.
  this.cameraRot = Math.PI / 4;
  this.dropThreshold = 100;
  this.dropCounter = 0;

  // Initialize some flags.
  this.initialized = false;
  this.keysAreBound = false;
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
    // TODO Check on this
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
            thisGame.board.shiftBlockX(-1);
          }
        }
        if (e.key == "ArrowDown" || e.key == "j" || e.key == "J") {
          if (!thisGame.paused) {
            thisGame.board.shiftBlockX(1);
          }
        }
        if (e.key == "ArrowLeft" || e.key == "h" || e.key == "H") {
          if (!thisGame.paused) {
            thisGame.board.shiftBlockZ(1);
          }
        }
        if (e.key == "ArrowRight" || e.key == "l" || e.key == "L") {
          if (!thisGame.paused) {
            thisGame.board.shiftBlockZ(-1);
          }
        }
        if (e.key == " ") {
          if (!thisGame.paused) {
            thisGame.dropCounter = thisGame.dropThreshold;
          }
        }
        if (e.key == "s" || e.key == "S") {
          if (!thisGame.paused) {
            thisGame.board.rotateBlockX();
          }
        }
        if (e.key == "d" || e.key == "D") {
          if (!thisGame.paused) {
            thisGame.board.rotateBlockY();
          }
        }
        if (e.key == "f" || e.key == "F") {
          if (!thisGame.paused) {
            thisGame.board.rotateBlockZ();
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
            thisGame.cameraRot -= ROTATION_AMOUNT
          }
        }
        if (e.key == "r" || e.key == "R") {
          if (!thisGame.paused) {
            thisGame.cameraRot += ROTATION_AMOUNT;
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
      if (this.dropCounter >= this.dropThreshold) {
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
