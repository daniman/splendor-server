module.exports = `
  type TakeGems implements Turn {
    when: String!
    playerId: ID!
    type: TurnType!
    gems: [GemColor!]!
  }

  type ReserveCard implements Turn {
    when: String!
    playerId: ID!
    type: TurnType!
    cardType: CardStackType
    card: Card
  }

  type PurchaseCard implements Turn {
    when: String!
    playerId: ID!
    type: TurnType!
    card: Card
  }

  interface Turn {
    when: String!
    playerId: ID!
    type: TurnType!
  }

  enum TurnType {
    TAKE_GEMS
    RESERVE_CARD
    PURCHASE_CARD
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

  enum CardStackType {
    I
    II
    III
  }

  type CardStack {
    type: CardStackType!
    remaining: Int!
    cards: [Card!]!
  }

  enum GameState {
    LOBBY
    ACTIVE
    COMPLETE
  }

  type Game {
    id: ID!
    players(currentPlayer: ID): [Player!]!
    player(id: ID!): Player
    currentTurn: Player
    state: GameState!
    name: String!
    bank: [CostUnit!]!
    turns: [Turn!]!
    nobles: [Card!]!
    cardStacks(type: CardStackType): [CardStack!]!
  }

  type Player {
    id: ID!
    bank: [CostUnit!]!
    reservedCards: [Card]!
    purchasedCards: [Card!]!
    nobles: [Card!]!
    score: Int!
  }

  type Query {
    game(id: ID!): Game
    allGames: [Game!]!
  }

  type Mutation {
    game(id: ID!): GameMutation
    newGame(name: String!): Game
  }

  type GameMutation {
    start: Game
    join(playerId: ID!): Game
    takeTurn(
      playerId: ID!
      takeGems: [GemColor!]
      returnGems: [GemColor!]
      purchaseCardById: ID
      reserveCardById: ID
      reserveCardFromStack: CardStackType
    ): Game
  }
`;
