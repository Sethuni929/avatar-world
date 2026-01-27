class MapObject {
  constructor(type, x, y, width = 1, height = 1) {
    this.type = type;       // object type: "tree", "coin", etc.
    this.x = x;             // center x coordinate
    this.y = y;             // center y coordinate
    this.width = width;     // width in squares
    this.height = height;   // height in squares
  }

  // helper to get all occupied cells
  getOccupiedCells() {
    const cells = [];
    const xOffset = Math.floor(this.width / 2);
    const yOffset = Math.floor(this.height / 2);

    for (let dx = -xOffset; dx < Math.ceil(this.width / 2); dx++) {
      for (let dy = -yOffset; dy < Math.ceil(this.height / 2); dy++) {
        cells.push({ x: this.x + dx, y: this.y + dy });
      }
    }
    return cells;
  }
}