module.exports = (cardStacks, bank, player, cardId) => {
  let found = false;

  cardStacks.forEach(({ cards }) => {
    if (cards.showing(cardId)) {
      try {
        const card = cards.find(cardId);
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

  if (player.reservedCards.map((c) => c.id).includes(cardId)) {
    try {
      const card = player.reservedCards.find((c) => c.id === cardId);
      const paidGems = player.purchaseCard(card);

      paidGems.forEach(({ gemColor, quantity }) => {
        bank.add(gemColor, quantity);
      });

      const cardPos = player.reservedCards.findIndex((c) => c.id === cardId);
      player.reservedCards.splice(cardPos, 1);
      found = true;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (!found) throw new Error(`Card ${cardId} is not available to purchase.`);
};
