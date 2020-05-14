module.exports = (cardStacks, bank, player, cardId, returnGems = []) => {
  let card = null;
  let found = false;
  cardStacks.forEach(({ cards }) => {
    if (cards.showing(cardId)) {
      try {
        if (bank.YELLOW > 0) {
          if (player.bank.gemCount() - returnGems.length >= 10) {
            throw new Error(
              `You already have 10 chips. Trade in one chip along with your reserve.`
            );
          }

          returnGems.forEach((gemColor) => {
            player.returnGem(gemColor, 1);
          });

          // otherwise... grant a yellow gem
          bank.subtract('YELLOW', 1);
          player.takeGem('YELLOW', 1);
        }

        card = cards.takeCard(cardId);
        player.reserveCard(card, false);

        found = true;
      } catch (e) {
        throw new Error(e.message);
      }
    }
  });

  if (!found) throw new Error(`Card ${cardId} is not available to reserve.`);
  return card;
};
