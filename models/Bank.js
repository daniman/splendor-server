class Bank {
  constructor() {
    this.RED = 0;
    this.BLUE = 0;
    this.GREEN = 0;
    this.BLACK = 0;
    this.WHITE = 0;
    this.YELLOW = 0;
  }

  add(color, quantity) {
    const prev = this[color];
    this[color] = prev + quantity;
  }

  subtract(color, quantity) {
    const prev = this[color];
    if (prev - quantity < 0)
      throw new Error('Cannot remove coins from empty bank.');

    this[color] = prev - quantity;
  }

  state() {
    return [
      {
        gemColor: 'RED',
        quantity: this.RED,
      },
      {
        gemColor: 'BLUE',
        quantity: this.BLUE,
      },
      {
        gemColor: 'GREEN',
        quantity: this.GREEN,
      },
      {
        gemColor: 'BLACK',
        quantity: this.BLACK,
      },
      {
        gemColor: 'WHITE',
        quantity: this.WHITE,
      },
      {
        gemColor: 'YELLOW',
        quantity: this.YELLOW,
      },
    ];
  }
}

module.exports = Bank;
