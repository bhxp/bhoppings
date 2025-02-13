export class CoordinateSystem {
  constructor() {
    this.index = {};
  }
  register(entityType, id, coordinates) {
    if (!this.index[entityType]) {
      this.index[entityType] = {};
    }
    this.index[entityType][id] = coordinates;
  }
  update(entityType, id, coordinates) {
    if (this.index[entityType] && this.index[entityType][id]) {
      this.index[entityType][id] = coordinates;
    }
  }
  get(entityType, id) {
    return (this.index[entityType] && this.index[entityType][id]) || null;
  }
  getAll() {
    return this.index;
  }
}
export const coordinateSystem = new CoordinateSystem();