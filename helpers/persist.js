const redis = require('redis');
const pubsub = require('./pubsub');
const Game = require('../models/Game');

const redisClient = process.env.REDIS_URL ? redis.createClient(process.env.REDIS_URL) : redis.createClient();

// map the games from redis to memory
const loadGames = () => {
  const games = [];
  redisClient.scan(0, 'MATCH', 'game:*', (err, reply) => {
    const storedGameIds = reply[1];
    for (const gameId of storedGameIds) {
      redisClient.get(gameId, (error, game) => {
        if(!error && game) {
          games.push(new Game(null, JSON.parse(game)));
        }
      })
    }
  });
  return games;
}

const updateRedis = (game) => {
  redisClient.set('game:' + game.id, JSON.stringify(game));
  redisClient.expire('game:' + game.id, 7200); // Games live in redis for up to two hours past the last action
  // TBD: the game will still be in memory after 2 hours
}

const persist = (game, mutation) => {
  if (mutation === 'delete') {
    console.log('TBD: delete mutation');
  } else {
    updateRedis(game);
  }
  pubsub.publish('allGamesPub',{ allGamesPub: game }); // since the game state is reflected in the list of games
  pubsub.publish('gameMutation',{ gameMutation: game });
}

module.exports = { loadGames, persist };
