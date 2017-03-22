"use strict";

// Global constants.
const TESTING = !true;
const FLIP_BOARD = !true;
const CORNER_CUBES = !true;
const ADD_FLOOR = true;
const ADD_FLOOR_TEXTURE = true;
const ADD_CUBE_TEXTURE = true;
const ADD_GRID_HELPER = !true;
const ADD_AXIS_HELPER = !true;
const CUBE_SIZE = 40;
const BOARD_SIZE = 10;
const BOARD_HEIGHT = 20;
const DEFAULT_BOARD = 0;
const ROTATION_AMOUNT = 0.05;

// Testing
var camera_y, camera_x, camera_z;
if (TESTING) {
  camera_y = 300;
  camera_x = 600;
  camera_z = 600;
} else {
  camera_y = 700;
  camera_x = 900;
  camera_z = 900;
}
if (FLIP_BOARD) {
  camera_x *= -1;
  camera_z *= -1;
}
const CAMERA_Y = camera_y;
const CAMERA_X = camera_x;
const CAMERA_Z = camera_z;
const CAMERA_POINT_Y = Math.floor(CAMERA_Y / 2);
const CAMERA_POINT_X = 0;
const CAMERA_POINT_Z = 0;
