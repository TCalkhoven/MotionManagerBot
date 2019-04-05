module.exports = class Motion {
  constructor(description, creator, maxVotes) {
    this.description = description;
    this.owner = creator;
    this.maxVotes = maxVotes;
    this.yay = [];
    this.nay = [];
  }

  getOwner() {
    return this.owner;
  }

  getDescription() {
    return this.description;
  }

  canVote(username) {
    if (this.yay.includes(username) || this.nay.includes(username)) {
      return false;
    }

    return true;
  }

  addVote(type, username) {
    if (type === "yay") {
      this.yay = this.yay.concat([username]);
    } else {
      this.nay = this.nay.concat([username]);
    }
    return `The current motion stands ${this.countYays()} to ${this.countNays()}.`;
  }

  countYays() {
    return this.yay.length;
  }

  countNays() {
    return this.nay.length;
  }

  hasEveryoneVoted() {
    return this.countYays() + this.countNays() >= this.maxVotes;
  }
};
