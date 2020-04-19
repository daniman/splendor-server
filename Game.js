const cardStart = require('./start-state-cards');
const bankStart = require('./start-state-bank');
const shuffle = require('./shuffle');
const Player = require('./Player');
const Bank = require('./Bank');

class Game {
  constructor(name) {
    this.id = 1234;
    // this.id = Math.floor(Math.random() * 10000);

    this.name = name;
    this.state = 'LOBBY';
    this.players = [];

    this.bank = new Bank();

    this.cards = {
      I: shuffle(cardStart.I),
      II: shuffle(cardStart.II),
      III: shuffle(cardStart.III),
      Noble: shuffle(cardStart.Noble),
    };

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
    Object.keys(bank).forEach((gemColor) => {
      this.bank.add(gemColor, bank[gemColor]);
    });
  }

  takeTurn(playerId, turnType, turnContext) {
    if (this.state !== 'ACTIVE')
      throw new Error('Cannot take a turn in the game until it is started.');

    const player = this.players.find((p) => p.id === playerId);
    if (!player)
      throw new Error(`There is no player with ID <${id}> in this game.`);

    if (turnType === 'TAKE_TWO_COINS') {
      if (!turnContext.takeTwoCoinsInput)
        throw new Error(`Cannot take ${turnType} turn without context.`);

      console.log('TODO');
    } else if (turnType === 'TAKE_THREE_COINS') {
      if (!turnContext.takeThreeCoinsInput)
        throw new Error(`Cannot take ${turnType} turn without context.`);

      const {
        gem1Color,
        gem2Color,
        gem3Color,
      } = turnContext.takeThreeCoinsInput;

      if (
        gem1Color === gem2Color ||
        gem2Color === gem3Color ||
        gem3Color === gem1Color
      )
        throw new Error('Cannot select two gems of the same color.');

      try {
        [gem1Color, gem2Color, gem3Color].forEach((gemColor) => {
          this.bank.subtract(gemColor, 1);
          player.takeGems(gemColor, 1);
        });

        this.turns.push({
          type: turnType,
          ...turnContext.takeThreeCoinsInput,
        });
      } catch (e) {
        throw new Error(e.message);
      }
    }
  }
}

module.exports = Game;
