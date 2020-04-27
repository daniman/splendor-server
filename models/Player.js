const Bank = require('./Bank');

class Player {
  constructor(id) {
    this.id = id;
    this.bank = new Bank();
    this.reservedCards = [];
    this.purchasedCards = [];
    this.nobles = [];
    this.score = 0;
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

  checkForNobles(nobleStack) {
    const wealth = {};
    this.purchasedCards.forEach(({ gemColor }) => {
      const a = wealth[gemColor] || 0;
      wealth[gemColor] = a + 1;
    });

    nobleStack.cards().forEach((card) => {
      const earned = card
        .cost()
        .map(({ gemColor, quantity }) => wealth[gemColor] >= quantity)
        .reduce((a, b) => a && b, true);

      if (earned) {
        const c = nobleStack.takeCard(card.id);
        this.nobles.push(c);
        this.score += c.pointValue;
      }
    });
  }

  purchaseCard(card) {
    // cache our cost for easier manipulation
    const cost = {};
    card.cost().forEach(({ gemColor, quantity }) => {
      cost[gemColor] = quantity;
    });

    // apply discounts to cost from purchased cards
    this.purchasedCards.forEach(({ gemColor }) => {
      if (!!cost[gemColor]) {
        const c = cost[gemColor];
        cost[gemColor] = c - 1;
      }
    });

    // check if we have the resources to actually buy the card
    let wildcards = this.bank.YELLOW;
    Object.keys(cost).forEach((gemColor) => {
      if (this.bank[gemColor] < cost[gemColor]) {
        wildcards -= cost[gemColor] - this.bank[gemColor];
        if (wildcards < 0)
          throw new Error(
            `Player "${this.id}" does not have enough ${gemColor} to purchase this card.`
          );
      }
    });

    // actually purchase the card
    this.purchasedCards.push(card);
    this.score += card.pointValue;

    // pay for the purchase
    const paid = {};
    Object.keys(cost).forEach((gemColor) => {
      while (this.bank[gemColor] < cost[gemColor]) {
        const c = cost[gemColor];
        cost[gemColor] = c - 1;
        this.bank.subtract('YELLOW', 1);
        const d = paid.YELLOW || 0;
        paid.YELLOW = d + 1;
      }

      this.bank.subtract(gemColor, cost[gemColor]);
      const e = paid[gemColor] || 0;
      paid[gemColor] = e + cost[gemColor];
    });

    // return the coins the user pays to the bank
    return Object.keys(paid).map((gemColor) => ({
      gemColor,
      quantity: paid[gemColor],
    }));
  }
}

module.exports = Player;
