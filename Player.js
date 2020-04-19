const Bank = require('./Bank');

class Player {
  constructor(id) {
    this.id = id;
    this.cards = [];
    this.bank = new Bank();
  }

  takeGems(gemColor, quantity) {
    this.bank.add(gemColor, quantity);
  }

  // addCard() {}
}

module.exports = Player;
