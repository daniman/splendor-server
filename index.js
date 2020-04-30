const { ApolloServer, ApolloError } = require('apollo-server');
const typeDefs = require('./schema');
const Game = require('./models/Game');

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
  },
  Mutation: {
    game: (_parent, args) => {
      const game = games.find((g) => `${g.id}` === args.id);
      // const game = Object.keys(games).find((gameId) => `${gameId}` === args.id);
      if (!game)
        throw new ApolloError(`Could not find game with ID: ${args.gameId}`);

      return game;
    },
    newGame: (_parent, args) => {
      const game = new Game(args.name);
      games.push(game);
      return game;
    },
  },
  GameMutation: {
    start: (game) => {
      try {
        game.startGame();
        return game;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    },
    join: (game, args) => {
      try {
        game.addPlayer(args.playerId);
        return game;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    },
    takeTurn(game, args) {
      const { playerId, ...context } = args;
      try {
        game.takeTurn(playerId, context);
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
    schemaTag: 'local',
    apiKey: 'service:splendor:SaDSZzGf0avhRcSqD8z_Mg',
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
