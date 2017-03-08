"use strict";

/* Cube Object.
 */
var Cube = function (x = 0, y = 0, z = 0, color = 0xffffff) {
  // Create geometry and material for cube.
  var cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  //var cubeMaterial = new THREE.MeshBasicMaterial({
  var cubeMaterial = new THREE.MeshPhongMaterial({
    color: color,
    shading: THREE.FlatShading,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    wireframe: false
  });

  // Create mesh for cube.
  var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

  // Create geometry and material for black outline of the cube.
  var cubeOutlineGeometry = new THREE.EdgesGeometry(cubeMesh.geometry);
  var cubeOutlineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1
  });
  var cubeOutlineLineSegments = new THREE.LineSegments(
    cubeOutlineGeometry,
    cubeOutlineMaterial
    );

  // Set cube and outline meshes and their positions.
  this.cube = cubeMesh;
  this.cubeOutline = cubeOutlineLineSegments;
  this.x = x;
  this.y = y;
  this.z = z;

  // Update this cube's position.
  this.updatePosition();

  // Use block number 0 by default.
  this.blockNumber = 0;
};

/* Prototype functions.
 */
Cube.prototype = {
  constructor: Cube,

  setCoordinates: function(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.updatePosition();
  },

  setX: function(x = 0) {
    this.x = x;

    this.updatePosition();
  },

  setY: function(y = 0) {
    this.y = y;

    this.updatePosition();
  },

  setZ: function(z = 0) {
    this.z = z;

    this.updatePosition();
  },

  updatePosition: function() {
    // We have the board centered on the y-axis, so we need to adjust the
    // position accordingly.
    var cubeOffset = CUBE_SIZE / 2;
    var xOffset = ((BOARD_SIZE / 2) * CUBE_SIZE) - cubeOffset;
    var zOffset = xOffset;
    var yOffset = cubeOffset
    var newX = (this.x * CUBE_SIZE) - xOffset;
    var newZ = (this.z * CUBE_SIZE) - zOffset;
    var newY = (this.y * CUBE_SIZE) + yOffset;

    // Move it to the provided location.
    this.cube.position.set(newX, newY, newZ);
    this.cubeOutline.position.set(newX, newY, newZ);
  },

  addToScene: function(scene) {
    scene.add(this.cube);
    scene.add(this.cubeOutline);
  }
};