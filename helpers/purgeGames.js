const purgeGames = games => {
  const hour = 60*60*1000;
  activeGames = [];
  games.forEach(game => {
    // finished games purge after an hour, active games after 4 hours, lobby games after 2
    let age = (new Date() - new Date(game.createdAt));
    if (game.turns.length) {
      const mostRecentTurn = game.turns.slice().reverse()[0].when;
      age = new Date()-new Date(mostRecentTurn);
    }
    if (
      (game.state === 'COMPLETE' && age < 1*hour) ||
      (game.state === 'ACTIVE' && age < 4*hour ) ||
      (game.state === 'LOBBY' && age < 2*hour ) 
    ) activeGames.push(game);
    else console.log(`Purged game ${game.name} in state ${game.state} after ${age/60000} minutes of inactivity`);
  });
  return activeGames;
};

module.exports = purgeGames;
