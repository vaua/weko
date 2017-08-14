var id;
var dna;
var parentAnimal;
var markedForDeath;
var debug = require('debug')('cell');
var proteins = {};
var cellAge;
var AGE_WHEN_CELL_CAN_DIE = 100;
var RISK_OF_CELL_DEATH_OF_OLD_AGE = 0.02

// Proteins definitions
var REDUCTION_START = 0;
var REDUCTION_LENGTH = 1;
var DIVISION_START = REDUCTION_START + REDUCTION_LENGTH;
var DIVISION_LENGTH = 10;
var NEURON_START = DIVISION_START + DIVISION_LENGTH;
var NEURON_LENGTH = 10;
var CONNECT_DENDRITES_START = NEURON_START + NEURON_LENGTH;
var CONNECT_DENDRITES_LENGTH = 5;
var DISCONNECT_DENDRITES_START = CONNECT_DENDRITES_START + CONNECT_DENDRITES_LENGTH;
var DISCONNECT_DENDRITES_LENGTH = 5;
var BLOCK_CONNECT_DENDRITES_START = DISCONNECT_DENDRITES_START + DISCONNECT_DENDRITES_LENGTH;
var BLOCK_CONNECT_DENDRITES_LENGTH = 5;
var BLOCK_DISCONNECT_DENDRITES_START = BLOCK_CONNECT_DENDRITES_START + BLOCK_CONNECT_DENDRITES_LENGTH;
var BLOCK_DISCONNECT_DENDRITES_LENGTH = 5;
var CONNECT_AXON_START = BLOCK_DISCONNECT_DENDRITES_START + BLOCK_DISCONNECT_DENDRITES_LENGTH;
var CONNECT_AXON_LENGTH = 10;
var BLOCK_CONNECT_AXON_START = CONNECT_AXON_START + CONNECT_AXON_LENGTH;
var BLOCK_CONNECT_AXON_LENGTH = 5;
var ACCEPT_DENDRITES_START = BLOCK_CONNECT_AXON_START + BLOCK_CONNECT_AXON_LENGTH;
var ACCEPT_DENDRITES_LENGTH = 5;
var BLOCK_ACCEPT_DENDRITES_START = ACCEPT_DENDRITES_START + ACCEPT_DENDRITES_LENGTH;
var BLOCK_ACCEPT_DENDRITES_LENGTH = 5;
var MOTOR_CELL_START = BLOCK_ACCEPT_DENDRITES_START + BLOCK_ACCEPT_DENDRITES_LENGTH;
var MOTOR_CELL_LENGTH = 10;
var OPTICAL_CELL_START = MOTOR_CELL_START + MOTOR_CELL_LENGTH;
var OPTICAL_CELL_LENGTH = 10;

var ALL_PROTEINS_LENGTH = OPTICAL_CELL_START + OPTICAL_CELL_LENGTH;



var Proteins = {
  REDUCES_PROTEINS :        REDUCTION_START,                 // Reduces the number of all proteins to half (but does not affect permanen proteins)
  START_CELL_DIVISION :     DIVISION_START,                  // If this protein is expressed, the cell will devide itself
  NEURON :                  NEURON_START,                    // Cell will get an axon that will connect to all at that time receptive axons. Permanent, makes cell neural cell.
  CONNECT_DENDRITES:        CONNECT_DENDRITES_START,         // Neural cell will connect its axon to currently receptive dendrites
  DISCONNECT_DENDRITES:     DISCONNECT_DENDRITES_START,      // Neural cell will disconnect X least used dendrites.
  BLOCK_CONNECT_DENDRITES:  BLOCK_CONNECT_DENDRITES_START,   // Blockerar protein that connects dendrites.
  CONNECT_AXON:             CONNECT_AXON_START,              // Neural cell connects to all receptive axons
  BLOCK_CONNECT_AXON:       BLOCK_CONNECT_AXON_START,        // Block cell from connecting to axons
  ACCEPT_DENDRITES:         ACCEPT_DENDRITES_START,          // Neural cell accepts dendrites
  BLOCK_ACCEPT_DENDRITES:   BLOCK_ACCEPT_DENDRITES_START,    // Blocks acceptance for dendrites
  DEVELOP_MOTOR_CELL:       MOTOR_CELL_START,                // Upon new cell division, this cell becomes motor cell
  DEVELOP_OPTICAL_CELL:     OPTICAL_CELL_START,              // Upon cell division, the daughter cell becomes optical cell.
};

function Cell(id, parent, dna, proteins) {
  this.cellAge = 0;
  this.id = id;
  this.dna = dna;
  this.markedForDeath = false;
  this.proteins = proteins;   // this is the protein map - needs to be halved for the more realistic scenario.
  this.parentAnimal = parent;
  this.proteins[Proteins.REDUCES_PROTEINS] = 1;
  this.positionInDna = 0;
  debug("New cell is born with name: " + this.id);
  debug("DNA is: " + this.dna);
}

Cell.prototype.hasProtein = function(protein) {
    //debug("Checking if protein" + protein + " exists in the cell.");
    if (protein in Object.keys(this.proteins)) {
      //debug("Protein is in the cell with concentration " + this.proteins[protein]);
      return this.proteins[protein] >= 1;
    }
    else return false;
}

Cell.prototype.tick = function() {
  var that = this;
  this.cellAge += 1;
  debug("Cell " + this.id + " is entering its " + this.cellAge + " tick.");

  // check cell age and kill cell if it dies.
  if (this.cellAge > AGE_WHEN_CELL_CAN_DIE) {
    // cell can die - some risk is applied
    if (Math.random() < RISK_OF_CELL_DEATH_OF_OLD_AGE) {
      //cell dies
      this.parentAnimal.addForRemoval(this);
    }
  }

  // Do what the DNA and outer and inner level tell you to do.
  //action = dna[innerLevel];
  debug("Protein keys in the beginning of turn: " + Object.keys(this.proteins));

  Object.keys(this.proteins).forEach(function(key) {
    debug("protein key: " + key + " value: " + that.proteins[key]);
  });

  // Expressing the DNA
  if (!(this.positionInDna < 0 || this.positionInDna > this.dna.length)) {
    debug("Expressing gene " + this.positionInDna + " with protein " + this.dna[this.positionInDna]);

    // Execute the action
    // TODO: Split this into two parts: first express the gene chosen, second act upon the proteins in the cell.

    // Expressing the genes
    var proteinExpressed = this.dna[this.positionInDna];

    // Nested if-statements checking which protein has been expressed.
    if (proteinExpressed < DIVISION_START) { // REDUCTION is expressed.
      if (this.proteins.hasOwnProperty('REDUCES_PROTEINS')) this.proteins[REDUCES_PROTEINS] += 1;
      else this.proteins[REDUCES_PROTEINS] = 1;
    } else if (proteinExpressed < NEURON_START) {
      debug('division.');
    } else if (proteinExpressed < CONNECT_DENDRITES_START) {
      debug("Neuron");
    } else if (proteinExpressed < DISCONNECT_DENDRITES_START) {
      debug("Connect dendrite");
    } else if (proteinExpressed < BLOCK_CONNECT_DENDRITES_START) {
      debug("Disconnect dendrites");
    } else if (proteinExpressed < CONNECT_AXON_START) {
      debug("Block conect dendrites");
    } else if (proteinExpressed < BLOCK_CONNECT_AXON_START) {
      debug("Axon start");
    } else if (proteinExpressed < ACCEPT_DENDRITES_START) {
      debug("Block connect axon");
    } else if (proteinExpressed < BLOCK_ACCEPT_DENDRITES_START) {
      debug("Accept dendrites start");
    } else if (proteinExpressed < MOTOR_CELL_START) {
      debug("Block accept dendrites");
    } else if (proteinExpressed < OPTICAL_CELL_START) {
      debug("Motor cell");
    } else if (proteinExpressed < ALL_PROTEINS_LENGTH) {
      debug("Optical cell");
    }

/*
    switch(this.dna[gene]) {
      case Proteins.REDUCES_PROTEINS:
        this.proteins[Proteins.REDUCES_PROTEINS] = 3;
        break;
      case Proteins.START_CELL_DIVISION:
        this.proteins[Proteins.START_CELL_DIVISION] = 1;
        break;
      case Proteins.NEURON:
        this.proteins[Proteins.NEURON] = 1;
        break;
      case Proteins.CONNECT_DENDRITES:
        this.proteins[Proteins.CONNECT_DENDRITES] = 1;
        break;
      case Proteins.DISCONNECT_DENDRITES:
        this.proteins[Proteins.DISCONNECT_DENDRITES] = 1;
        break;
      case Proteins.DISCONNECT_DENDRITES_3:
        this.proteins[Proteins.DISCONNECT_DENDRITES] = 3;
        break;
      case Proteins.DISCONNECT_DENDRITES_5:
        this.proteins[Proteins.DISCONNECT_DENDRITES] = 5;
        break;
      case Proteins.BLOCK_CONNECT_DENDRITES:
        this.proteins[Proteins.BLOCK_CONNECT_DENDRITES] = 1;
        break;
      case Proteins.BLOCK_CONNECT_DENDRITES_3:
        this.proteins[Proteins.BLOCK_CONNECT_DENDRITES] = 3;
        break;
      case Proteins.BLOCK_CONNECT_DENDRITES_5:
        this.proteins[Proteins.BLOCK_CONNECT_DENDRITES] = 5;
        break;
      case Proteins.CONNECT_AXON:
        this.proteins[Proteins.CONNECT_AXON] = 1;
        break;
      case Proteins.CONNECT_AXON_5:
        this.proteins[Proteins.CONNECT_AXON] = 5;
        break;
      case Proteins.BLOCK_CONNECT_AXON:
        this.proteins[Proteins.BLOCK_CONNECT_AXON] = 1;
        break;
      case Proteins.BLOCK_CONNECT_AXON_3:
        this.proteins[Proteins.BLOCK_CONNECT_AXON] = 3;
        break;
      case Proteins.ACCEPT_DENDRITES:
        this.proteins[Proteins.ACCEPT_DENDRITES] = 1;
        break;
      case Proteins.ACCEPT_DENDRITES_5:
        this.proteins[Proteins.ACCEPT_DENDRITES] = 5;
        break;
      case Proteins.BLOCK_ACCEPT_DENDRITES:
        this.proteins[Proteins.BLOCK_ACCEPT_DENDRITES] = 1;
        break;
      case Proteins.BLOCK_ACCEPT_DENDRITES_5:
        this.proteins[Proteins.BLOCK_ACCEPT_DENDRITES] = 5;
        break;
      case Proteins.DEVELOP_MOTOR_CELL:
        this.proteins[Proteins.DEVELOP_MOTOR_CELL] = 1;
        break;
      case Proteins.DEVELOP_OPTICAL_CELL:
        this.proteins[Proteins.DEVELOP_OPTICAL_CELL] = 1;
        break;
      default:
        debug("A gene with no rule for expressing has been found. Setting it to multiply!");
        this.proteins[Proteins.START_CELL_DIVISION] = 1;
*/

  } else {
    debug("The DNA position " + this.positionInDna + " is outside of the size od DNA. No protein was expressed.");
  }

  // increase positionInDna
  this.positionInDna += 1;

  // Now, do actions for all proteins found in the cell
  if (this.hasProtein(Proteins.REDUCES_PROTEINS)) {
    debug("Reducing proteins (not yet).");
    //reduceProteinMixByHalf(this.proteins);
  }

  if (this.hasProtein(Proteins.START_CELL_DIVISION)) {
    debug("Creating new cell!");
    //TODO: Reduce protein mix to half before spawing the cell.
    reduceProteinMixByHalf(this.proteins);

    // copy the proteins, TODO: reduce the number
    var newCellProtein = {};
    Object.keys(this.proteins).forEach(function(key) {
      newCellProtein[key] = that.proteins[key];
    });
    this.parentAnimal.createNewCell(this.dna, this.proteins);
    this.parentAnimal.health -= 1; // Reduce the health upon birth
  }

  if (this.hasProtein(Proteins.NEURON)) {
    debug("I am a neuron cell!");

    if (this.hasProtein(Proteins.CONNECT_DENDRITES)) {
      debug("Connecting dendrites");
    }

    if (this.hasProtein(Proteins.ACCEPT_DENDRITES)) {
      debug("Accepting dendrites");
    }

    if (this.hasProtein(Proteins.DICCONNECT_DENDRITES)) {
      debug("Disconnecting dendrites");
    }

    if (this.hasProtein(Proteins.CONNECT_AXON)) {
      debug("Connecting Axon!");
    }

    if (this.hasProtein(Proteins.DEVELOP_MOTOR_CELL)) {
      debug("I'm a motor cell!");
    }

    if (this.hasProtein(Proteins.DEVELOP_OPTICAL_CELL)) {
      debug("I'm a optical cell!");
    }
  }

  // Once done with all actions, reduce all protein concentrations by 1
  reduceProteinMixByOne(this.proteins);

  // run the neural network, inputs, inter, outputs
}

/*
Calculate the protein sum mix.
*/
function calculateProteinMix(proteins) {
  proteinSum = 1;
  proteinLength = 0;
  keys = Object.keys(proteins);
  proteinsLength = keys.length;

  if (!(proteinsLength > 0)) {
    debug("There are no proteins in the cell");
    return 0;
  }

  for (i = 1; i < proteinsLength + 1; i++) {
    if (proteins[keys[i]] > 0) {
      debug("Increasing sum by " + (keys[i]));
      proteinLength += 1;
      proteinSum += parseInt(keys[i]);
    }
  }
  debug("Length is: " + proteinLength +  ", protein sum " + proteinSum);

  if (proteinSum == 0 || proteinLength == 0) return 0;
  proteinSum = (proteinSum / (proteinLength * 20)).toPrecision(2);

  debug("Protein concentration is " + proteinSum);
  return proteinSum;
}

function reduceProteinMixByHalf(proteins) {
  Object.keys(proteins).forEach(function(key) {
    proteins[key] = proteins[key] / 2;
    if (proteins[key] < 1) delete proteins[key];
  });
}

function reduceProteinMixByOne(proteins) {
  Object.keys(proteins).forEach(function(key) {
    if (proteins[key] > 1) proteins[key] -= 1;
    if (proteins[key] < 1) delete proteins[key];
  });
}

function getProteinConcentration(protein) {
  //debug("Protein je: " + protein);
  if (protein !== undefined) return protein;
  else return 0;
}

module.exports = Cell;
