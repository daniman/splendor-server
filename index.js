const { ApolloServer, ApolloError } = require('apollo-server');
const typeDefs = require('./schema');
const Game = require('./models/Game');
const redis = require('redis');

const redisClient = process.env.REDIS_URL
  ? redis.createClient(process.env.REDIS_URL)
  : redis.createClient();

/**
 * Game logic:
 * - Build a "reserve from top of the deck" pathway.
 *
 * Implementation details:
 * - Consider switching from in-memory to using a DB.
 * - Have games clean themselves up when finished to save memory? Provide a way to delete games?
 * - Figure out how to turn this whole thing into TS with hot module reloading?
 */

let games = [];

// When the server starts up, pull all the games that are currently
// persisted in redis.
redisClient.scan(0, 'MATCH', 'game:*', function (err, reply) {
  const storedGameIds = reply[1];
  for (var gameId of storedGameIds) {
    redisClient.get(gameId, function (error, game) {
      if (!error && game) {
        games.push(new Game(null, JSON.parse(game)));
      }
    });
  }
});

// Starter state helper:
// let games = [new Game('The Game')];
// games[0].addPlayer('dani');
// games[0].addPlayer('dani2');
// games[0].addPlayer('dani3');
// games[0].addPlayer('dani4');
// games[0].startGame();
// games[0].takeTurn('dani', {
//   takeGems: ['WHITE', 'BLUE', 'GREEN'],
// });
// games[0].takeTurn('dani2', {
//   takeGems: ['WHITE', 'BLUE', 'GREEN'],
// });
// games[0].takeTurn('dani3', {
//   takeGems: ['WHITE', 'BLUE', 'GREEN'],
// });
// games[0].takeTurn('dani4', {
//   reserveCardById: games[0].cardStacks[0].cards.visible[3].id,
// });
// games[0].takeTurn('dani', {
//   reserveCardFromStack: 'I',
// });

function updateRedis(game) {
  redisClient.set('game:' + game.id, JSON.stringify(game));

  // Store the game in redis for up to two hours past the last action taken.
  redisClient.expire('game:' + game.id, 7200);
}

const resolvers = {
  Query: {
    game: (_parent, args, _context, _info) =>
      games.find((g) => `${g.id}` === args.id),
    allGames: () => games,
  },
  Card: {
    cost: (card) => card.cost(),
  },
  CardStack: {
    remaining: (stack) => stack.cards.hidden.length,
    cards: (stack) => stack.cards.visible,
  },
  Game: {
    bank: (game) => game.bank.state(),
    player: (game, args) => {
      const player = game.players.find((p) => p.id === args.id);
      if (!player)
        throw new ApolloError(`Could not find player with ID: ${args.id}`);
      return player;
    },
    players: (game, args) => {
      return game.players.map((p) => ({
        ...p,
        reservedCards: p.reservedCards.map((rc) =>
          game.state === 'COMPLETE' ||
          !rc.isPrivate ||
          p.id === args.currentPlayer ||
          args.currentPlayer === 'sudo'
            ? { card: rc.card }
            : { card: null }
        ),
      }));
    },
    nobles: (game) => game.nobles.visible,
    cardStacks: (game, args) =>
      !!args.type
        ? game.cardStacks.filter((s) => s.type === args.type)
        : game.cardStacks,
  },
  Turn: {
    __resolveType(obj) {
      if (obj.type === 'TAKE_GEMS') {
        return 'TakeGems';
      }

      if (obj.type === 'RESERVE_CARD') {
        return 'ReserveCard';
      }

      if (obj.type === 'PURCHASE_CARD') {
        return 'PurchaseCard';
      }

      return null;
    },
  },
  Player: {
    bank: (player) => player.bank.state(),
    reservedCards: (player) => player.reservedCards.map(({ card }) => card),
  },
  Mutation: {
    game: (_parent, args) => {
      const game = games.find((g) => `${g.id}` === args.id);
      if (!game)
        throw new ApolloError(`Could not find game with ID: ${args.gameId}`);

      return game;
    },
    newGame: (_parent, args) => {
      const game = new Game(args.name);
      games.push(game);
      updateRedis(game);
      return game;
    },
  },
  GameMutation: {
    start: (game) => {
      try {
        game.startGame();
        updateRedis(game);
        return game;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    },
    join: (game, args) => {
      try {
        game.addPlayer(args.playerId);
        updateRedis(game);
        return game;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    },
    takeTurn(game, args) {
      const { playerId, ...context } = args;
      try {
        game.takeTurn(playerId, context);
        updateRedis(game);
        return game;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    graphVariant: process.env.NODE_ENV || 'local',
    reportSchema: true,
    sendHeaders: { all: true },
    sendVariableValues: { all: true },

    // URLs for reporting to Studio staging instead of Studio prod.
    // tracesEndpointUrl: 'https://engine-staging-report.apollodata.com',
    // schemaReportingUrl:
    // 'https://engine-staging-graphql.apollographql.com/api/graphql',
  },
  playground: true,
});

server
  .listen({
    port: process.env.PORT || 4000,
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
