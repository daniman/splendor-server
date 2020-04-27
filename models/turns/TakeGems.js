module.exports = (bank, player, gemList) => {
  if (gemList.includes('YELLOW'))
    throw new Error('Cannot select YELLOW gems directly from the bank.');

  if (gemList.length > 3) throw new Error('Can only select 3 gems or less.');

  if (gemList.length > 2 && new Set(gemList).size !== gemList.length)
    throw new Error(
      'Cannot select two gems of the same color when selecting more than 2 gems.'
    );

  if (
    gemList.length === 2 &&
    gemList[0] === gemList[1] &&
    bank[gemList[0]] < 4
  ) {
    throw new Error(
      `Cannot take 2 gems from the ${gemList[0]} stack when there are only ${
        bank[gemList[0]]
      } available.`
    );
  }

  try {
    gemList.forEach((gemColor) => {
      bank.subtract(gemColor, 1);
      player.addGem(gemColor, 1);
    });
  } catch (e) {
    throw new Error(e.message);
  }
};
