
class MapObjectTest {
  constructor() {}

  testSingleCellObject() {
    const obj = new MapObject("coin", 5, 5);
    const cells = obj.getOccupiedCells();

    if (cells.length !== 1)
      throw "1x1 object should occupy exactly 1 cell";

    if (cells[0].x !== 5 || cells[0].y !== 5)
      throw "1x1 object has incorrect coordinates";
  }

  testThreeByThreeObjectCount() {
    const obj = new MapObject("tree", 10, 10, 3, 3);
    const cells = obj.getOccupiedCells();

    if (cells.length !== 9)
      throw "3x3 object should occupy 9 cells";
  }

  testThreeByThreeObjectCoordinates() {
    const obj = new MapObject("tree", 10, 10, 3, 3);
    const cells = obj.getOccupiedCells();

    const expected = [
      { x: 9, y: 9 }, { x: 9, y: 10 }, { x: 9, y: 11 },
      { x: 10, y: 9 }, { x: 10, y: 10 }, { x: 10, y: 11 },
      { x: 11, y: 9 }, { x: 11, y: 10 }, { x: 11, y: 11 }
    ];

    for (const coord of expected) {
      if (!cells.some(c => c.x === coord.x && c.y === coord.y)) {
        throw "3x3 object returned incorrect occupied cells";
      }
    }
  }

  testRectangularObject() {
    const obj = new MapObject("wall", 0, 0, 2, 3);
    const cells = obj.getOccupiedCells();

    if (cells.length !== 6)
      throw "2x3 object should occupy 6 cells";
  }

  run() {
    console.log("=== Running MapObject Tests ===");
    try {
      this.testSingleCellObject();
      this.testThreeByThreeObjectCount();
      this.testThreeByThreeObjectCoordinates();
      this.testRectangularObject();
      console.log("All MapObject tests passed ✅");
    } catch (err) {
      console.error("MapObject test failed ❌:", err);
    }
  }
}
