class World {
  constructor(name, length, width) {
    this.name = name;
    this.length = length;
    this.width = width;
    this.objects = new ObjectRegistry();
  }

  getName() {
    return this.name;
  }

  getLength() {
    return this.length;
  }

  getWidth() {
    return this.width;
  }

  // protected by convention
  getObjectRegistry() {
    return this.objects;
  }

  getObjectCount(type) {
    return this.objects.getObjectCount(type);
  }

  getObjectAtLocation(x, y) {
    return this.objects.getObjectsAt(x, y);
  }

  getObjectLocation(object) {
    return { x: object.x, y: object.y };
  }

  moveObject(object, newX, newY) {
    this.objects.move(object, newX, newY);
  }

  addObject(object) {
    this.objects.add(object);
  }

  removeObject(object, x, y) {
    // x,y included for UML consistency; registry already knows footprint
    this.objects.remove(object);
  }

  changeObjectAt(newObject, x, y) {
    const existing = this.getObjectAtLocation(x, y);
    for (const obj of existing) {
      this.objects.remove(obj);
    }
    this.objects.add(newObject);
  }

}
