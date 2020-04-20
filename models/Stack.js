const shuffle = require('../helpers/shuffle');

class Stack {
  constructor(cardArray, numShowing) {
    const stack = shuffle(cardArray);

    this.visible = stack.slice(0, numShowing);
    this.hidden = stack.slice(numShowing);
  }

  showing(cardId) {
    return this.visible.map((c) => c.id).includes(cardId);
  }

  takeCard(cardId) {
    const cardPos = this.visible.findIndex((obj) => obj.id === cardId);

    if (cardPos < 0)
      throw new Error(`Invalid cardId to request for taking: ${cardId}.`);

    const replacementCard = this.hidden.pop();
    if (replacementCard) {
      // return the card
      return this.visible.splice(cardPos, 1, replacementCard)[0];
    } else {
      // return the card
      return this.visible.splice(cardPos, 1)[0];
    }
  }

  popCardFromTop() {
    const card = this.hidden.pop();
    return card;
  }
}

module.exports = Stack;
