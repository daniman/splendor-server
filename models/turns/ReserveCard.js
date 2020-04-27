module.exports = (cardStacks, bank, player, cardId) => {
  let found = false;
  cardStacks.forEach(({ cards }) => {
    if (cards.showing(cardId)) {
      try {
        const card = cards.takeCard(cardId);
        player.reserveCard(card);

        if (bank.YELLOW > 0) {
          bank.subtract('YELLOW', 1);
          player.addGem('YELLOW', 1);
        }

        found = true;
      } catch (e) {
        throw new Error(e.message);
      }
    }
  });

  if (!found) throw new Error(`Card ${cardId} is not available to reserve.`);
};
