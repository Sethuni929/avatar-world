class Avatar {
  constructor(name, x, y, speed, direction) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.direction = direction;
  }

  getName() {
    return this.name;
  }

  turn(direction) {
  // Case 1: direction is a word ("left" / "right")
  if (typeof direction === "string") {
    const dir = direction.toLowerCase();

    if (dir === "left") {
      this.direction = (this.direction - 90 + 360) % 360;
      return;
    }

    if (dir === "right") {
      this.direction = (this.direction + 90) % 360;
      return;
    }
  }

  // Case 2: direction is a number (float or int)
  if (!isNaN(parseFloat(direction)) && isFinite(direction)) {
    this.direction = (this.direction + Number(direction)) % 360;
    return;
  }

  // Invalid input
  console.warn("Invalid turn input:", direction);
}


  move(length) {
  // convert degrees → radians
  const rad = this.direction * (Math.PI / 180);

  // movement distance
  const dist = length * this.speed;

  // update position
  this.x += Math.sin(rad) * dist;
  this.y += Math.cos(rad) * dist;
}


  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  interactWithObject(object, action) {
    if (typeof object[action] === "function") {
      object[action](this);
    }
  }

  pickUp(object) {
    if (typeof object.onPickUp === "function") {
      object.onPickUp(this);
    }
  }
}
