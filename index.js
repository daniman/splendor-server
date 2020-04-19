const { ApolloServer } = require('apollo-server');
const cardStart = require('./start-state-cards');
const bankStart = require('./start-state-bank');

const typeDefs = `
enum TurnType {
  PURCHASE
  RESERVE
  COLLECT
}

type Turn {
  type: TurnType!
}

enum GemColor {
  WHITE
  BLUE
  GREEN
  RED
  BLACK
  YELLOW
}

type CostUnit {
  gemColor: GemColor!
  quantity: Int!
}

type Card {
  id: ID!
  gemColor: GemColor
  pointValue: Int!
  cost: [CostUnit!]!
}

type CardStack {
  I: [Card!]!
  II: [Card!]!
  III: [Card!]!
  Noble: [Card!]!
}

type Game {
  id: ID!
  name: String!
  cards: CardStack!
  bank: [CostUnit!]!
}

type Query {
  game(id: ID!): Game
}
`;

function shuffle(arr) {
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
}

class Game {
  constructor() {
    this.id = Math.floor(Math.random() * 10000);
    this.name = 'danimani';

    this.cards = {
      I: shuffle(cardStart.I),
      II: shuffle(cardStart.II),
      III: shuffle(cardStart.III),
      Noble: shuffle(cardStart.Noble),
    };

    this.bank = Object.keys(bankStart).map((gemColor) => ({
      gemColor,
      quantity: bankStart[gemColor],
    }));
  }
}

const games = [new Game()];
games.forEach((g) => {
  console.log(g.id);
});

const resolvers = {
  Query: {
    game: (_parent, args, _context, _info) => {
      return games.find((g) => `${g.id}` === args.id);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
