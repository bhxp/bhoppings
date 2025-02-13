export class NetworkManager {
  constructor() {
    this.room = null;
    this.clientId = null;
  }

  async init() {
    this.room = new WebsimSocket();
    this.clientId = this.room.party.client.id;
    
    // Send initial join message
    this.room.send({
      type: 'playerJoin',
      position: { x: 0, y: 0, z: 0 }
    });
  }

  getClientId() {
    return this.clientId;
  }

  onPlayerJoin(callback) {
    this.room.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'playerJoin') {
        callback(data.clientId, data.position);
      }
    };
  }

  onPlayerLeave(callback) {
    this.room.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'disconnected') {
        callback(data.clientId);
      }
    };
  }

  onCarUpdate(callback) {
    this.room.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'carUpdate') {
        callback(data.clientId, data.position, data.rotation, data.speed);
      }
    };
  }

  sendCarUpdate(position, rotation, speed) {
    this.room.send({
      type: 'carUpdate',
      position: position,
      rotation: rotation,
      speed: speed
    });
  }
}