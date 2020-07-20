const cardStart = require('../data/start-state-cards');
const bankStart = require('../data/start-state-bank');

const Player = require('./Player');
const Bank = require('./Bank');
const Stack = require('./Stack');

const takeGemsTurn = require('./turns/TakeGems');
const purchaseCardTurn = require('./turns/PurchaseCard');
const reserveCardTurn = require('./turns/ReserveCard');
const reserveCardFromStackTurn = require('./turns/ReserveCardFromStack');

const shuffle = require('../helpers/shuffle');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

class Game {
  constructor(name, backup) {
    if (!backup) {
      this.id = new Array(4)
        .fill(0)
        .map(() => alphabet[Math.floor(Math.random() * 26)])
        .join('');
      this.name = name;
      this.createdAt = new Date();
      this.state = 'LOBBY';

      this.players = [];
      this.winner = null;

      // Don't set nobles until game start, because the number of nobles
      // depends on the number of players.
      this.nobles = null;

      this.currentTurn = null;

      this.bank = new Bank();

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

    } else { // Restore a game from redis
      this.id = backup.id;
      this.name = backup.name;
      this.createdAt = new Date(backup.createdAt);
      this.state = backup.state;
      this.winner = backup.winner;
      this.bank = new Bank(backup.bank);
      this.cardStacks = [
        {
          type: 'III',
          cards: new Stack(null, null, null, backup.cardStacks[0].cards),
        },
        {
          type: 'II',
          cards: new Stack(null, null, null, backup.cardStacks[1].cards),
        },
        {
          type: 'III',
          cards: new Stack(null, null, null, backup.cardStacks[2].cards),
        },
      ];

      this.players = [];
      for (var playerBackup of backup.players) {
        this.players.push(new Player(playerBackup.id, playerBackup));
      }

      if (backup.currentTurn) {
        this.currentTurn = this.players.find(
          (player) => player.id === backup.currentTurn.id
        );
      } else {
        this.currentTurn = null;
      }

      if (backup.nobles) {
        this.nobles = new Stack(null, null, null, backup.nobles);
      }

      this.turns = backup.turns;
    }
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

    this.nobles = new Stack(cardStart.Noble, this.players.length + 1, true);

    this.state = 'ACTIVE';

    const bank = bankStart[`${this.players.length}`];

    this.players = shuffle(this.players);
    this.currentTurn = this.players[0];

    // initialize the bank
    Object.keys(bank).forEach((gemColor) => {
      this.bank.add(gemColor, bank[gemColor]);
    });
  }

  advanceTurn(playerId) {
    const i = this.players.findIndex((p) => p.id === playerId);
    this.currentTurn = this.players[(i + 1) % this.players.length];
  }

  takeTurn(playerId, turnContext) {
    if (this.state === 'LOBBY')
      throw new Error('Cannot take a turn in the game until it is started.');

    if (this.state === 'COMPLETE')
      throw new Error('This game is complete! No more turns can be taken.');

    if (playerId !== this.currentTurn.id)
      throw new Error(
        `Sorry ${player}, it's not your turn... it's ${this.currentTurn.id}'s turn.`
      );

    const player = this.players.find((p) => p.id === playerId);
    if (!player)
      throw new Error(`There is no player with ID <${playerId}> in this game.`);

    const { returnGems, ...restOfTheContext } = turnContext;
    if (Object.keys(restOfTheContext).length > 1)
      throw new Error('Cannot provide context for more than one turn at once.');

    const {
      takeGems,
      purchaseCardById,
      reserveCardById,
      reserveCardFromStack,
    } = restOfTheContext;

    const context = {};
    if (!!takeGems) {
      takeGemsTurn(this.bank, player, takeGems, returnGems);

      context.type = 'TAKE_GEMS';
      context.gems = takeGems;
    } else if (!!reserveCardById) {
      const card = reserveCardTurn(
        this.cardStacks,
        this.bank,
        player,
        reserveCardById,
        returnGems
      );

      context.type = 'RESERVE_CARD';
      context.card = card;
    } else if (!!reserveCardFromStack) {
      const card = reserveCardFromStackTurn(
        this.cardStacks.find((s) => s.type === reserveCardFromStack),
        this.bank,
        player,
        returnGems
      );

      context.type = 'RESERVE_CARD';
      context.cardType = reserveCardFromStack;
    } else if (!!purchaseCardById) {
      const card = purchaseCardTurn(
        this.cardStacks,
        this.bank,
        player,
        purchaseCardById
      );
      player.checkForNobles(this.nobles);

      context.type = 'PURCHASE_CARD';
      context.card = card;
    } else {
      throw new Error('Cannot execute a turn when no context was provided.');
    }

    this.advanceTurn(playerId);
    this.turns.push({
      when: new Date().toISOString(),
      playerId,
      ...context,
    });

    // check for a winner
    this.players.forEach((p) => {
      if (p.score >= 15 && this.turns.length % this.players.length === 0)
        this.state = 'COMPLETE';
      this.winner = p;
    });
  }
}

module.exports = Game;
