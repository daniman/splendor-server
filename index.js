const { ApolloServer, ApolloError } = require('apollo-server');
const typeDefs = require('./schema');
const Game = require('./models/Game');

/**
 * Implement turn switching and the enforcement of turn ordering.
 *
 * Figure out how to instantiate more than one game in memory.
 * Implement "instantiate game on demand", so we can have multiple rooms.
 *
 * Implement "winner" logic.
 *
 * Implement Nobles logic.
 *
 * Make a Card model. Update Card resolver and Player and Game purchasing
 * logic as a result, instead of spreading the ...cost object and mapping keys everywhere.
 *
 * Implement "max 10 coins" logic. Maybe implement a "put back" aspect of the
 * take coins mutation as a result.
 *
 * Don't allow YELLOW coins to be taken directly as coins from the bank.
 *
 * Implement YELLOW coin logic for purchasing.
 *
 * Build in purchased card values into card purchasing and Noble attraction.
 *
 * Clean up models. Maybe switch from in-memory to using a DB.
 *
 * Figure out why Type II cards only have 29 cards, not 30.
 *
 * Have games clean themselves up when finished to save memory?
 *
 * Figure out how to turn this whole thing into TS with hot module reloading?
 */

const games = [new Game('The Game')];

const resolvers = {
  Query: {
    game: (_parent, args, _context, _info) => {
      return games.find((g) => `${g.id}` === args.id);
    },
  },
  Card: {
    cost: (card) => {
      const { id, gemColor, pointValue, ...cost } = card;
      return Object.keys(cost).map((gemColor) => ({
        gemColor,
        quantity: cost[gemColor],
      }));
    },
  },
  CardStack: {
    remaining: (stack) => stack.cards.hidden.length,
    cards: (stack) => stack.cards.visible,
  },
  Game: {
    bank: (game) =>
      Object.keys(game.bank).map((gemColor) => ({
        gemColor,
        quantity: game.bank[gemColor],
      })),
    player: (game, args) => {
      const player = game.players.find((p) => p.id === args.id);
      if (!player)
        throw new ApolloError(`Could not find player with ID: ${args.id}`);
      return player;
    },
    nobles: (game) => game.nobles.visible,
    cardStacks: (game, args) =>
      game.cardStacks.filter((s) => s.type === args.type),
  },
  Turn: {
    __resolveType(obj) {
      if (obj.type === 'TAKE_THREE_GEMS') {
        return 'TakeThreeGems';
      }

      if (obj.type === 'TAKE_TWO_GEMS') {
        return 'TakeTwoGems';
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
    bank: (player) =>
      Object.keys(player.bank).map((gemColor) => ({
        gemColor,
        quantity: player.bank[gemColor],
      })),
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
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
