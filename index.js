const { ApolloServer, ApolloError } = require('apollo-server');
const typeDefs = require('./schema');
const Game = require('./Game');

/**
 * Fill in all the turn types.
 *
 * Figure out how to enforce an ordering of turns for the players, so players
 * can't make actions outside their turn.
 *
 * Figure out how to instantiate more than one game in memory.
 *
 * Implement "winner" logic.
 *
 * Simplify mutation Turn API to not need to accept TurnType, as it can be inferred.
 *    playerId: ID!,
      type: TurnType!,
      takeTwoCoinsInput: TakeTwoCoinsInput,
      takeThreeCoinsInput: TakeThreeCoinsInput
 */

const games = [new Game('The Game')];

const resolvers = {
  Query: {
    game: (_parent, args, _context, _info) => {
      return games.find((g) => `${g.id}` === args.id);
    },
  },
  Game: {
    bank: (game) => {
      return Object.keys(game.bank).map((gemColor) => ({
        gemColor,
        quantity: game.bank[gemColor],
      }));
    },
  },
  Turn: {
    __resolveType(obj) {
      if (obj.type === 'TAKE_THREE_COINS') {
        return 'TakeThreeCoins';
      }

      if (obj.type === 'TAKE_TWO_COINS') {
        return 'TakeTwoCoins';
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
    bank: (player) => {
      return Object.keys(player.bank).map((gemColor) => ({
        gemColor,
        quantity: player.bank[gemColor],
      }));
    },
  },
  Mutation: {
    game: (_parent, args) => {
      const game = games.find((g) => `${g.id}` === args.id);
      if (!game)
        throw new ApolloError(`Could not find game with ID: ${args.gameId}`);

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
      const { playerId, type, ...context } = args;
      try {
        game.takeTurn(playerId, type, context);
        return game;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
