module.exports = (cardStacks, bank, player, cardId) => {
  let found = false;
  let card = null;

  cardStacks.forEach(({ cards }) => {
    if (cards.showing(cardId)) {
      try {
        card = cards.find(cardId);
        const paidGems = player.purchaseCard(card);

        paidGems.forEach(({ gemColor, quantity }) => {
          bank.add(gemColor, quantity);
        });

        cards.takeCard(cardId);
        found = true;
      } catch (e) {
        throw new Error(e.message);
      }
    }
  });

  if (player.reservedCards.map(({ card }) => card.id).includes(cardId)) {
    try {
      card = player.reservedCards.find(({ card }) => card.id === cardId).card;
      const paidGems = player.purchaseCard(card);

      paidGems.forEach(({ gemColor, quantity }) => {
        bank.add(gemColor, quantity);
      });

      const cardPos = player.reservedCards.findIndex(
        ({ card }) => card.id === cardId
      );
      player.reservedCards.splice(cardPos, 1);
      found = true;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (!found) throw new Error(`Card ${cardId} is not available to purchase.`);
  return card;
};
