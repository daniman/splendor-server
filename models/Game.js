const cardStart = require('../data/start-state-cards');
const bankStart = require('../data/start-state-bank');

const Player = require('./Player');
const Bank = require('./Bank');
const Stack = require('./Stack');

class Game {
  constructor(name) {
    this.id = 1234;
    // TODO: proper ID generation
    // this.id = Math.floor(Math.random() * 10000);

    this.name = name;
    this.state = 'LOBBY';
    this.players = [];

    this.bank = [];

    this.stacks = [
      {
        type: 'NOBLE',
        cards: new Stack(cardStart.Noble, 5),
      },
      {
        type: 'III',
        cards: new Stack(cardStart.III, 4),
      },
      {
        type: 'II',
        cards: new Stack(cardStart.II, 4),
      },
      {
        type: 'I',
        cards: new Stack(cardStart.I, 4),
      },
    ];

    this.turns = [];
  }

  addPlayer(id) {
    if (this.players.length >= 4)
      throw new Error('This game already has 4 players.');

    if (this.players.map((p) => p.id).includes(id))
      throw new Error(
        `There is already a player with ID <${id}> in this game.`
      );

    if (this.state !== 'LOBBY')
      throw new Error(
        'Cannot join a game that is already in progress or completed.'
      );

    this.players.push(new Player(id));
  }

  startGame() {
    if (this.players.length < 2)
      throw new Error('Cannot start game with less than 2 players.');

    if (this.state !== 'LOBBY')
      throw new Error('Cannot start a game already in progress or completed.');

    this.state = 'ACTIVE';

    const bank = bankStart[`${this.players.length}`];

    // initialize the bank
    this.bank = new Bank();
    Object.keys(bank).forEach((gemColor) => {
      this.bank.add(gemColor, bank[gemColor]);
    });
  }

  takeTurn(playerId, turnContext) {
    if (this.state !== 'ACTIVE')
      throw new Error('Cannot take a turn in the game until it is started.');

    const player = this.players.find((p) => p.id === playerId);

    if (!player)
      throw new Error(`There is no player with ID <${playerId}> in this game.`);

    if (!!turnContext.takeTwoCoins) {
      /**
       * Turn: TAKE_TWO_COINS
       */

      const { gemColor } = turnContext.takeTwoCoins;

      try {
        if (this.bank[gemColor] < 4) {
          throw new Error(
            `Cannot take 2 coins from the ${gemColor} stack when there are only ${this.bank[gemColor]} available.`
          );
        }

        this.bank.subtract(gemColor, 2);
        player.addGem(gemColor, 2);

        this.turns.push({
          playerId,
          type: 'TAKE_TWO_COINS',
          ...turnContext.takeTwoCoins,
        });
      } catch (e) {
        throw new Error(e.message);
      }
    } else if (!!turnContext.takeThreeCoins) {
      /**
       * Turn: TAKE_THREE_COINS
       */

      const { gem1Color, gem2Color, gem3Color } = turnContext.takeThreeCoins;

      if (
        gem1Color === gem2Color ||
        gem2Color === gem3Color ||
        gem3Color === gem1Color
      ) {
        throw new Error('Cannot select two gems of the same color.');
      }

      try {
        [gem1Color, gem2Color, gem3Color].forEach((gemColor) => {
          this.bank.subtract(gemColor, 1);
          player.addGem(gemColor, 1);
        });

        this.turns.push({
          playerId,
          type: 'TAKE_THREE_COINS',
          ...turnContext.takeThreeCoins,
        });
      } catch (e) {
        throw new Error(e.message);
      }
    } else if (!!turnContext.reserveCardById) {
      /**
       * Turn: RESERVE_CARD
       */

      const id = turnContext.reserveCardById;

      let found = false;
      this.stacks
        .filter(({ type }) => type !== 'NOBLE')
        .forEach(({ cards: stack }) => {
          if (stack.showing(id)) {
            try {
              const card = stack.takeCard(id);
              player.reserveCard(card);

              if (this.bank.YELLOW > 0) {
                this.bank.subtract('YELLOW', 1);
                player.addGem('YELLOW', 1);
              }

              this.turns.push({
                playerId,
                type: 'RESERVE_CARD',
                id,
              });

              found = true;
            } catch (e) {
              throw new Error(e.message);
            }
          }
        });

      if (!found)
        throw new Error(
          `Card ${turnContext.reserveCardById} is not available to reserve.`
        );
    } else if (!!turnContext.purchaseCardById) {
      /**
       * Turn: PURCHASE_CARD
       */

      console.log('TODO: build PURCAHSE_CARD action');
    } else {
      throw new Error('Cannot execute a turn when no context was provided.');
    }
  }
}

module.exports = Game;
