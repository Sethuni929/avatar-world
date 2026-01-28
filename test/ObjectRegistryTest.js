class ObjectRegistryTest {
  constructor() {
    this.registry = new ObjectRegistry();

    // simple mock objects (no dependency on MapObject)
 this.obj1 = {
  type: "tree",
  x: 2,
  y: 2,
  getOccupiedCells: function() { return [{ x: this.x, y: this.y }]; }
};
this.obj2 = {
  type: "rock",
  x: 5,
  y: 5,
  getOccupiedCells: function() { 
    return [
      { x: this.x, y: this.y },
      { x: this.x, y: this.y + 1 },
      { x: this.x + 1, y: this.y },
      { x: this.x + 1, y: this.y + 1 }
    ]; 
  }
};
  }

  testAdd() {
    this.registry.add(this.obj1);
    this.registry.add(this.obj2);
    if (this.registry.getObjectCount() !== 2) throw "add() failed";
  }

  testGetObjectsAt() {
    const result = this.registry.getObjectsAt(2, 2);
    if (!result.includes(this.obj1)) throw "getObjectsAt() failed";
  }

  testGetObjectsByType() {
    const trees = this.registry.getObjectsByType("tree");
    if (!trees.includes(this.obj1)) throw "getObjectsByType() failed";
  }

  testGetObjectsAtWithType() {
    const filtered = this.registry.getObjectsAtWithType(2, 2, "tree");
    if (!filtered.includes(this.obj1)) throw "getObjectsAtWithType() failed";
  }

  testMove() {
    this.registry.move(this.obj1, 3, 3);
    if (!this.registry.getObjectsAt(3, 3).includes(this.obj1))
      throw "move() failed";
  }

  testRemove() {
    this.registry.remove(this.obj2);
    if (this.registry.getObjectCount() !== 1) throw "remove() failed";
  }

  run() {
    console.log("=== Running ObjectRegistry Tests ===");
    try {
      this.testAdd();
      this.testGetObjectsAt();
      this.testGetObjectsByType();
      this.testGetObjectsAtWithType();
      this.testMove();
      this.testRemove();
      console.log("All ObjectRegistry tests passed ✅");
    } catch (err) {
      console.error("ObjectRegistry test failed ❌:", err);
    }
  }
}
