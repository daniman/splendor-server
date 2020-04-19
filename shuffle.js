module.exports = function shuffle(arr) {
  var copy = [],
    n = arr.length,
    i;

  // While there remain elements to shuffle...
  while (n) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * arr.length);

    // If not already shuffled, move it to the new array.
    if (i in arr) {
      copy.push(arr[i]);
      delete arr[i];
      n--;
    }
  }

  return copy.map(({ id, gemColor, pointValue, ...coinCost }) => ({
    id,
    gemColor,
    pointValue,
    cost: Object.keys(coinCost).map((gemColor) => ({
      gemColor,
      quantity: coinCost[gemColor],
    })),
  }));
};
