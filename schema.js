module.exports = `
  type TakeTwoCoins implements Turn {
    playerId: ID!
    type: TurnType!
    gemColor: GemColor!
  }

  type TakeThreeCoins implements Turn {
    playerId: ID!
    type: TurnType!
    gem1Color: GemColor!
    gem2Color: GemColor!
    gem3Color: GemColor!
  }

  type ReserveCard implements Turn {
    playerId: ID!
    type: TurnType!
    id: ID!
  }

  type PurchaseCard implements Turn {
    playerId: ID!
    type: TurnType!
    id: ID!
  }

  interface Turn {
    playerId: ID!
    type: TurnType!
  }

  enum TurnType {
    TAKE_TWO_COINS
    TAKE_THREE_COINS
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
    NOBLE
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
    state: GameState!
    name: String!
    stacks: [CardStack!]!
    players: [Player!]!
    player(id: ID!): Player
    bank: [CostUnit!]!
    turns: [Turn!]!
  }

  type Player {
    id: ID!
    bank: [CostUnit!]!
    reservedCards: [Card!]!
    purchasedCArds: [Card!]!
  }

  type Query {
    game(id: ID!): Game
  }

  type Mutation {
    game(id: ID!): GameMutation
  }

  type GameMutation {
    start: Game
    join(playerId: ID!): Game
    takeTurn(
      playerId: ID!
      takeTwoCoins: TakeTwoCoinsInput
      takeThreeCoins: TakeThreeCoinsInput
      reserveCardById: ID
      purchaseCardById: ID
    ): Game
  }

  input TakeTwoCoinsInput {
    gemColor: GemColor!
  }

  input TakeThreeCoinsInput {
    gem1Color: GemColor!
    gem2Color: GemColor!
    gem3Color: GemColor!
  }
`;
