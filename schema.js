module.exports = `
  type TakeTwoCoins implements Turn {
    type: TurnType!
    gemColor: GemColor!
  }

  type TakeThreeCoins implements Turn {
    type: TurnType!
    gem1Color: GemColor!
    gem2Color: GemColor!
    gem3Color: GemColor!
  }

  type ReserveCard implements Turn {
    type: TurnType!
    id: ID!
  }

  type PurchaseCard implements Turn {
    type: TurnType!
    id: ID!
  }

  interface Turn {
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

  type CardStack {
    I: [Card!]!
    II: [Card!]!
    III: [Card!]!
    Noble: [Card!]!
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
    cards: CardStack!
    bank: [CostUnit!]!
    players: [Player!]!
    turns: [Turn!]!
  }

  type Player {
    id: ID!
    bank: [CostUnit!]!
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
      playerId: ID!,
      type: TurnType!,
      takeTwoCoinsInput: TakeTwoCoinsInput,
      takeThreeCoinsInput: TakeThreeCoinsInput
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

  input ReserveCardInput {
    id: ID!
  }

  input PurchaseCardInput {
    id: ID!
  }
`;
