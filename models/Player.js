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
    const { id, gemColor: gemColorUnused, pointValue, ...cost } = card;

    // Check that we have the resources to buy the card.
    Object.keys(cost).forEach((gemColor) => {
      if (this.bank[gemColor] < cost[gemColor])
        throw new Error(
          `Player "${id}" does not have enough ${gemColor} to purchase this card.`
        );
    });

    this.purchasedCards.push(card);
    Object.keys(cost).forEach((gemColor) => {
      this.bank.subtract(gemColor, cost[gemColor]);
    });

    return Object.keys(cost).map((gemColor) => ({
      gemColor,
      quantity: cost[gemColor],
    }));
  }
}

module.exports = Player;
