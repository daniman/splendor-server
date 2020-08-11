module.exports = ({ cards }, bank, player, returnGems = []) => {
  let card = null;

  try {

    if (player.reservedCards.length >= 3) {
      throw new Error(
        `You already have 3 cards reserved.`
      );
    }

    if (bank.YELLOW > 0) {
      if (player.bank.gemCount() - returnGems.length >= 10) {
        throw new Error(
          `You already have 10 chips. Trade in one chip along with your reserve.`
        );
      }

      returnGems.forEach((gemColor) => {
        player.returnGem(gemColor, 1);
        bank.add(gemColor, 1);
      });

      // otherwise... grant a yellow gem
      bank.subtract('YELLOW', 1);
      player.takeGem('YELLOW', 1);
    }

    card = cards.takeCardFromTop();
    player.reserveCard(card, true);

    found = true;
  } catch (e) {
    throw new Error(e.message);
  }

  if (!found) throw new Error(`Card ${cardId} is not available to reserve.`);
  return card;
};
