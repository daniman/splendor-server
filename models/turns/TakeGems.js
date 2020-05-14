module.exports = (bank, player, takeGemList = [], returnGemList = []) => {
  if (takeGemList.includes('YELLOW'))
    throw new Error('You can only take a gold chip when reserving a card.');

  if (takeGemList.length > 3)
    throw new Error('You can only take up to three chips in a turn.');

  if (
    takeGemList.length > 2 &&
    new Set(takeGemList).size !== takeGemList.length
  )
    throw new Error(
      'When you take three chips, each must be a different color.'
    );

  if (player.bank.gemCount() + takeGemList.length - returnGemList.length > 10)
    throw new Error(
      `To take this many chips, you must return at least ${player.bank.gemCount() + takeGemList.length - 10} chip(s).`
    );

  if (
    takeGemList.length === 2 &&
    takeGemList[0] === takeGemList[1] &&
    bank[takeGemList[0]] < 4
  ) {
    throw new Error(
      `You cannot take 2 chips of the same color from a stack with fewer than 4 chips.`
    );
  }

  try {
    takeGemList.forEach((gemColor) => {
      bank.subtract(gemColor, 1);
      player.takeGem(gemColor, 1);
    });
    returnGemList.forEach((gemColor) => {
      player.returnGem(gemColor, 1);
      bank.add(gemColor, 1);
    });
  } catch (e) {
    throw new Error(e.message);
  }
};
