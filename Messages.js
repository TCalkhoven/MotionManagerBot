module.exports = class Messages {
  constructor() {
    this.messageIds = [];
  }

  addMessage(id) {
    if (!this.messageIds.includes(id)) {
      this.messageIds = this.messageIds.concat([id]);
    }
  }

  getMessageIds() {
    return this.messageIds;
  }

  clearMessages() {
    this.messageIds = [];
  }
};
