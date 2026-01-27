// AvatarTest.js
// Make sure Avatar.js is loaded first if using a <script> in HTML

class AvatarTest {
  constructor() {
    this.avatar = new Avatar("testingAvatar", 3, 4, 2, 90);
  }

  // === Individual Test Functions ===
  testGetName() {
    if (this.avatar.getName() !== "testingAvatar") throw "getName failed";
  }

  testTurnLeftRight() {
    this.avatar.direction = 0;
    this.avatar.turn("left");
    if (this.avatar.direction !== 270) throw "turn('left') failed";

    this.avatar.turn("right");
    if (this.avatar.direction !== 0) throw "turn('right') failed";
  }

  testTurnNumber() {
    this.avatar.direction = 0;
    this.avatar.turn(45);
    if (this.avatar.direction !== 45) throw "turn(45) failed";
  }

  testMove() {
    this.avatar.x = 0;
    this.avatar.y = 0;
    this.avatar.speed = 2;
    this.avatar.direction = 0;
    this.avatar.move(3); // moves forward along 0 degrees
    if (Math.abs(this.avatar.x - 0) > 0.0001 || Math.abs(this.avatar.y - 6) > 0.0001)
      throw "move failed";
  }

  testMoveTo() {
    this.avatar.moveTo(10, 10);
    if (this.avatar.x !== 10 || this.avatar.y !== 10) throw "moveTo failed";
  }

  testInteractWithObject() {
    let interacted = false;
    const obj1 = { actionFunc: (avatar) => { interacted = avatar.name; } };
    this.avatar.interactWithObject(obj1, "actionFunc");
    if (interacted !== this.avatar.name) throw "interactWithObject failed";
  }

  testPickUp() {
    let pickedUp = false;
    const obj2 = { onPickUp: (avatar) => { pickedUp = avatar.name; } };
    this.avatar.pickUp(obj2);
    if (pickedUp !== this.avatar.name) throw "pickUp failed";
  }

  // === Run all tests ===
  run() {
    console.log("=== Running all Avatar tests ===");
    try {
      this.testGetName();
      this.testTurnLeftRight();
      this.testTurnNumber();
      this.testMove();
      this.testMoveTo();
      this.testInteractWithObject();
      this.testPickUp();
      console.log("All Avatar tests passed ✅");
    } catch (err) {
      console.error("Avatar test failed ❌:", err);
    }
  }
}
