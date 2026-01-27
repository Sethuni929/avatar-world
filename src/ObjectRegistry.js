class ObjectRegistry {
  constructor() {
    this.registry = new Map();  // x → y → Set of objects
    this.typeIndex = new Map(); // type → Set of objects
  }

  // Add an object to registry
  add(obj) {
    const cells = obj.getOccupiedCells();
    for (const { x, y } of cells) {
      if (!this.registry.has(x)) this.registry.set(x, new Map());
      if (!this.registry.get(x).has(y)) this.registry.get(x).set(y, new Set());
      this.registry.get(x).get(y).add(obj);
    }

    if (!this.typeIndex.has(obj.type)) this.typeIndex.set(obj.type, new Set());
    this.typeIndex.get(obj.type).add(obj);
  }

  // Remove an object from registry
  remove(obj) {
    const cells = obj.getOccupiedCells();
    for (const { x, y } of cells) {
      this.registry.get(x)?.get(y)?.delete(obj);
      if (this.registry.get(x)?.get(y)?.size === 0) this.registry.get(x).delete(y);
      if (this.registry.get(x)?.size === 0) this.registry.delete(x);
    }

    this.typeIndex.get(obj.type)?.delete(obj);
    if (this.typeIndex.get(obj.type)?.size === 0) this.typeIndex.delete(obj.type);
  }

  // Move object to new center
  move(obj, newX, newY) {
    this.remove(obj);
    obj.x = newX;
    obj.y = newY;
    this.add(obj);
  }

  // Get all objects at a specific (x,y) cell
  getObjectsAt(x, y) {
    return Array.from(this.registry.get(x)?.get(y) || []);
  }

  // Get all objects of a specific type
  getObjectsByType(type) {
    return Array.from(this.typeIndex.get(type) || []);
  }

  // Get objects filtered by type AND location
  getObjectsAtWithType(x, y, type) {
    return this.getObjectsAt(x, y).filter(obj => obj.type === type);
  }

  // Get total count (optionally filtered by type)
  getObjectCount(type = null) {
    if (type) return this.getObjectsByType(type).length;
    let count = 0;
    for (const objSet of this.typeIndex.values()) {
      count += objSet.size;
    }
    return count;
  }
}
