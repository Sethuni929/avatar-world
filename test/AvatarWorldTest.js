class AvatarWorldTest {
  constructor() {
    this.world = new World("IntegrationWorld", 20, 20);
    this.avatar = new Avatar("Hero", 0, 0, 1, 0);
  }

  // === Individual Test Functions ===

  testAvatarMovementInWorld() {
    this.avatar.moveTo(5, 5);

    if (this.avatar.x !== 5 || this.avatar.y !== 5)
      throw "Avatar moveTo failed";
  }

  testWorldObjectPlacement() {
    this.tree = new MapObject("tree", 6, 6);
    this.coin = new MapObject("coin", 7, 7);

    this.world.addObject(this.tree);
    this.world.addObject(this.coin);

    if (this.world.getObjectCount() !== 2)
      throw "World object placement failed";
  }

  testAvatarReachesObject() {
    this.avatar.moveTo(6, 6);
    const objects = this.world.getObjectAtLocation(6, 6);

    if (!objects.includes(this.tree))
      throw "Avatar did not reach object correctly";
  }

  testObjectInteraction() {
    let pickedUp = false;

    // Make collectible fully compatible with World / ObjectRegistry
    const collectible = {
      x: 7,
      y: 7,
      getOccupiedCells: function() {
        return [{ x: this.x, y: this.y }];
      },
      onPickUp: (avatar) => {
        pickedUp = avatar.getName();
        // Remove itself from world after being picked up
        this.world.removeObject(collectible);
      }
    };

    // Replace the coin with this interactive object
    this.world.changeObjectAt(collectible, 7, 7);

    this.avatar.moveTo(7, 7);
    this.avatar.pickUp(collectible);

    if (pickedUp !== "Hero")
      throw "Avatar interaction failed";
  }

  testWorldStateAfterInteraction() {
    // Only the tree should remain after picking up collectible
    if (this.world.getObjectCount() !== 1)
      throw "World state incorrect after interaction";
  }

  // === Run all integration tests ===
  run() {
    console.log("=== Running Integration Test ===");
    try {
      this.testAvatarMovementInWorld();
      this.testWorldObjectPlacement();
      this.testAvatarReachesObject();
      this.testObjectInteraction();
      this.testWorldStateAfterInteraction();

      console.log("Integration test passed. All systems working together");
    } catch (err) {
      console.error("Integration test failed:", err);
      throw err; // rethrow so TestSuite sees the failure if any
    }
  }
}
