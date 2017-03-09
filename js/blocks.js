"use strict";

// Block piece constants.
/*
  Shape:
    ::::::::

  Color:
    Light Blue
*/
const BLOCK_1 = {
  color: 0x00ffff,
  depth: 4,
  height: 4,
  width: 4,
  grid: [
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  ]
};
/*
  Shape:
    ::
    ::::::

  Color:
    Blue
*/
const BLOCK_2 = {
  color: 0x0000ff,
  depth: 3,
  height: 3,
  width: 3,
  grid: [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
  ]
};
/*
  Shape:
    Cube

  Color:
    Yellow
*/
const BLOCK_3 = {
  color: 0xffff00,
  depth: 2,
  height: 2,
  width: 2,
  grid: [
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ]
  ]
};
/*
  Shape:
      ::::
    ::::

  Color:
    Green
*/
const BLOCK_4 = {
  color: 0x00ff00,
  depth: 3,
  height: 3,
  width: 3,
  grid: [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
  ]
};
/*
  Shape:
      ::
    ::::::

  Color:
    Purple
*/
const BLOCK_5 = {
  color: 0xaa00ff,
  depth: 3,
  height: 3,
  width: 3,
  grid: [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
  ]
};
/*
  Shape:
    Jack

  Color:
    Red
*/
const BLOCK_6 = {
  color: 0xff0000,
  depth: 3,
  height: 3,
  width: 3,
  grid: [
    [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]
  ]
};
/*
  Shape:
    ::::::
    ::  ::

  Color:
    Orange
*/
const BLOCK_7 = {
  color: 0xffa500,
  depth: 3,
  height: 3,
  width: 3,
  grid: [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [1, 1, 1],
      [1, 0, 1],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
  ]
};
