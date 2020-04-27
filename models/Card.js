class Card {
  constructor({ id, gemColor, pointValue, BLACK, RED, GREEN, WHITE, BLUE }) {
    this.id = id;
    this.gemColor = gemColor;
    this.pointValue = pointValue;
    this.BLACK = BLACK;
    this.RED = RED;
    this.GREEN = GREEN;
    this.WHITE = WHITE;
    this.BLUE = BLUE;
  }

  cost() {
    return [
      {
        gemColor: 'BLACK',
        quantity: this.BLACK,
      },
      {
        gemColor: 'RED',
        quantity: this.RED,
      },
      {
        gemColor: 'GREEN',
        quantity: this.GREEN,
      },
      {
        gemColor: 'WHITE',
        quantity: this.WHITE,
      },
      {
        gemColor: 'BLUE',
        quantity: this.BLUE,
      },
    ].filter((c) => c.quantity > 0);
  }
}

module.exports = Card;
