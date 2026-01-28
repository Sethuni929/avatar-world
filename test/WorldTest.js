class WorldTest {
  constructor() {
    this.world = new World("TestWorld", 100, 100);
  }

  testAddObject() {
    const tree = new MapObject("tree", 2, 2);
    this.world.addObject(tree);

    if (this.world.getObjectCount() !== 1)
      throw "addObject failed";
  }

  testGetObjectAtLocation() {
    const tree = new MapObject("tree", 5, 5);
    this.world.addObject(tree);

    const objects = this.world.getObjectAtLocation(5, 5);
    if (!objects.includes(tree))
      throw "getObjectAtLocation failed";
  }

  testGetObjectLocation() {
    const rock = new MapObject("rock", 8, 9);
    this.world.addObject(rock);

    const loc = this.world.getObjectLocation(rock);
    if (loc.x !== 8 || loc.y !== 9)
      throw "getObjectLocation failed";
  }

  testMoveObject() {
    const tree = new MapObject("tree", 1, 1);
    this.world.addObject(tree);

    this.world.moveObject(tree, 4, 4);
    const objects = this.world.getObjectAtLocation(4, 4);

    if (!objects.includes(tree))
      throw "moveObject failed";
  }

  testRemoveObject() {
    const rock = new MapObject("rock", 6, 6); 
    this.world.removeObject(rock);
const objectsAt6_6 = this.world.getObjectAtLocation(6, 6);
if (objectsAt6_6.includes(rock)) throw "removeObject failed";
  }

  testChangeObjectAt() {
    const tree = new MapObject("tree", 3, 3);
    this.world.addObject(tree);

    const bush = new MapObject("bush", 3, 3);
    this.world.changeObjectAt(bush, 3, 3);

    const objects = this.world.getObjectAtLocation(3, 3);

    if (!objects.includes(bush) || objects.includes(tree))
      throw "changeObjectAt failed";
  }

  run() {
    console.log("=== Running World Tests ===");
    try {
      this.testAddObject();
      this.testGetObjectAtLocation();
      this.testGetObjectLocation();
      this.testMoveObject();
      this.testRemoveObject();
      this.testChangeObjectAt();
      console.log("All World tests passed ✅");
    } catch (err) {
      console.error("World test failed ❌:", err);
    }
  }
}
