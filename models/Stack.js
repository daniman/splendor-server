const Card = require('./Card');
const shuffle = require('../helpers/shuffle');

class Stack {
  constructor(cardArray, numShowing, dontReplace = false) {
    const stack = shuffle(cardArray.slice()).map((card) => new Card(card));

    this.visible = stack.slice(0, numShowing);
    this.hidden = stack.slice(numShowing);
    this.dontReplace = dontReplace;
  }

  cards() {
    return this.visible;
  }

  showing(cardId) {
    return this.visible.map((c) => c.id).includes(cardId);
  }

  find(cardId) {
    const cardPos = this.visible.findIndex((obj) => obj.id === cardId);
    return this.visible[cardPos];
  }

  takeCard(cardId) {
    const cardPos = this.visible.findIndex((obj) => obj.id === cardId);

    if (cardPos < 0)
      throw new Error(`Invalid cardId to request for taking: ${cardId}.`);

    const replacementCard = this.hidden.pop();
    if (replacementCard && !this.dontReplace) {
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
