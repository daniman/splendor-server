const Bank = require('./Bank');
const Card = require('./Card');

class Player {
  constructor(id, backup) {
    this.id = id;
    if (!backup) {
      this.bank = new Bank();
      this.reservedCards = [];
      this.purchasedCards = [];
      this.nobles = [];
      this.score = 0;
      
    } else {
      this.bank = new Bank(backup.bank);
      this.reservedCards = backup.reservedCards.map((card) => new Card(card));
      this.purchasedCards = backup.purchasedCards.map((card) => new Card(card));
      this.nobles = backup.nobles.map((card) => new Card(card));
      this.score = backup.score;
    }
  }

  takeGem(gemColor, quantity) {
    this.bank.add(gemColor, quantity);
  }

  returnGem(gemColor, quantity) {
    this.bank.subtract(gemColor, quantity);
  }

  reserveCard(card, isPrivate) {
    this.reservedCards.push({ isPrivate, card });
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
