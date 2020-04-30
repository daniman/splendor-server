module.exports = (bank, player, takeGemList = [], returnGemList = []) => {
  if (takeGemList.includes('YELLOW'))
    throw new Error('Cannot select YELLOW gems directly from the bank.');

  if (takeGemList.length > 3)
    throw new Error('Can only select 3 gems or less.');

  if (
    takeGemList.length > 2 &&
    new Set(takeGemList).size !== takeGemList.length
  )
    throw new Error(
      'Cannot select two gems of the same color when selecting more than 2 gems.'
    );

  console.log(player.bank.gemCount(), takeGemList.length, returnGemList.length);
  if (player.bank.gemCount() + takeGemList.length - returnGemList.length > 10)
    throw new Error(
      `Cannot hold more than 10 gems: ${
        player.id
      } already has ${player.bank.gemCount()} gems and cannot take ${
        takeGemList.length
      } more. Try returning more gems.`
    );

  console.log(player.bank.gemCount());

  if (
    takeGemList.length === 2 &&
    takeGemList[0] === takeGemList[1] &&
    bank[takeGemList[0]] < 4
  ) {
    throw new Error(
      `Cannot take 2 gems from the ${
        takeGemList[0]
      } stack when there are only ${bank[takeGemList[0]]} available.`
    );
  }

  try {
    takeGemList.forEach((gemColor) => {
      bank.subtract(gemColor, 1);
      player.takeGem(gemColor, 1);
    });
    returnGemList.forEach((gemColor) => {
      player.returnGem(gemColor, 1);
    });
  } catch (e) {
    throw new Error(e.message);
  }
};
