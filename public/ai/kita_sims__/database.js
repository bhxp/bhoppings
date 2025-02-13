export class Database {
  constructor() {
    this.data = {
      layers: {}, // layerNumber -> layer data
      npcs: {},   // npc id -> npc data
      objects: {}, // object id -> object data
      items: {},   // items if needed
      rooms: {}    // room id -> room data
    };
  }

  registerLayer(layerNum, layerData) {
    this.data.layers[layerNum] = layerData;
    this.save();
  }

  getLayer(layerNum) {
    return this.data.layers[layerNum];
  }

  registerNPC(id, npcData) {
    this.data.npcs[id] = npcData;
    this.save();
  }

  getNPC(id) {
    return this.data.npcs[id];
  }

  registerObject(id, objectData) {
    this.data.objects[id] = objectData;
    this.save();
  }

  getObject(id) {
    return this.data.objects[id];
  }

  registerRoom(id, roomData) {
    this.data.rooms[id] = roomData;
    this.save();
  }

  getRoom(id) {
    return this.data.rooms[id];
  }

  save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gameDatabase', JSON.stringify(this.data));
    }
  }

  load() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('gameDatabase');
      if (saved) {
        this.data = JSON.parse(saved);
      }
    }
  }
}

export const gameDatabase = new Database();
gameDatabase.load();