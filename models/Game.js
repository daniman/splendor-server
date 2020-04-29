const cardStart = require('../data/start-state-cards');
const bankStart = require('../data/start-state-bank');

const Player = require('./Player');
const Bank = require('./Bank');
const Stack = require('./Stack');

const takeGemsTurn = require('./turns/TakeGems');
const purchaseCardTurn = require('./turns/PurchaseCard');
const reserveCardTurn = require('./turns/ReserveCard');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

class Game {
  constructor(name) {
    this.id = new Array(4)
      .fill(0)
      .map(() => alphabet[Math.floor(Math.random() * 26)])
      .join('');
    this.name = name;

    this.state = 'LOBBY';
    this.players = [];
    this.playerRankings = [];
    this.winner = null;

    this.bank = new Bank();

    this.nobles = new Stack(cardStart.Noble, 5, true);

    this.cardStacks = [
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
        `There is already a player with the name "${id}" in this game.`
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

  checkIfWon() {}

  takeTurn(playerId, turnContext) {
    if (this.state === 'LOBBY')
      throw new Error('Cannot take a turn in the game until it is started.');

    if (this.state === 'COMPLETE')
      throw new Error('This game is complete! No more turns can be taken.');

    if (Object.keys(turnContext).length > 1)
      throw new Error('Cannot provide context for more than one turn at once.');

    const player = this.players.find((p) => p.id === playerId);

    if (!player)
      throw new Error(`There is no player with ID <${playerId}> in this game.`);

    const {
      takeGems,
      returnGems, // TODO: handle the case where a user is trying to return gems too
      reserveCardById,
      purchaseCardById,
    } = turnContext;

    if (!!takeGems) {
      takeGemsTurn(this.bank, player, takeGems);

      this.turns.push({
        playerId,
        type: 'TAKE_GEMS',
        gems: takeGems,
      });
    } else if (!!reserveCardById) {
      reserveCardTurn(this.cardStacks, this.bank, player, reserveCardById);

      this.turns.push({
        playerId,
        type: 'RESERVE_CARD',
        id: reserveCardById,
      });
    } else if (!!purchaseCardById) {
      purchaseCardTurn(this.cardStacks, this.bank, player, purchaseCardById);
      player.checkForNobles(this.nobles);

      this.turns.push({
        playerId,
        type: 'PURCHASE_CARD',
        id: purchaseCardById,
      });
    } else {
      throw new Error('Cannot execute a turn when no context was provided.');
    }

    // check for a winner
    this.players.forEach((p) => {
      if (p.score >= 15) this.state = 'COMPLETE';
    });
  }
}

module.exports = Game;
