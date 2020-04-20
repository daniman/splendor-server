const Bank = require('./Bank');

class Player {
  constructor(id) {
    this.id = id;
    this.bank = new Bank();
    this.reservedCards = [];
    this.purchasedCards = [];
  }

  addGem(gemColor, quantity) {
    this.bank.add(gemColor, quantity);
  }

  reserveCard(card) {
    if (this.reservedCards.length >= 3)
      throw new Error(
        'Cannot reserve card because you already have 3 reserved.'
      );

    this.reservedCards.push(card);
  }

  purchaseCard(card) {
    // check for cost
    // push to purchasedCards
  }
}

module.exports = Player;
