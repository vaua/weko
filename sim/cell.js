var id;
var dna;
var parentAnimal;
var markedForDeath;
var debug = require('debug')('cell');
var proteins = {};
var cellAge;
var AGE_WHEN_CELL_CAN_DIE = 100;
var RISK_OF_CELL_DEATH_OF_OLD_AGE = 0.02

var Proteins = {
  REDUCES_PROTEINS : 0,          // Reduces the number of all proteins to half (but does not affect permanen proteins)
  START_CELL_DIVISION : 1,       // If this protein is expressed, the cell will devide itself
  NEURON : 2,                    // Cell will get an axon that will connect to all at that time receptive axons. Permanent, makes cell neural cell.
  CONNECT_DENDRITES: 3,          // Neural cell will connect its axon to currently receptive dendrites
  DISCONNECT_DENDRITES: 4,       // Neural cell will disconnect X least used dendrites.
  DISCONNECT_DENDRITES_3: 5,       // Neural cell will disconnect X least used dendrites.
  DISCONNECT_DENDRITES_5: 6,       // Neural cell will disconnect X least used dendrites.
  BLOCK_CONNECT_DENDRITES: 7,    // Blockerar protein that connects dendrites.
  BLOCK_CONNECT_DENDRITES_3: 8,    // Blockerar protein that connects dendrites.
  BLOCK_CONNECT_DENDRITES_5: 9,    // Blockerar protein that connects dendrites.
  CONNECT_AXON: 10,              // Neural cell connects to all receptive axons
  CONNECT_AXON_5: 11,              // Neural cell connects to all receptive axons
  BLOCK_CONNECT_AXON: 12,        // Block cell from connecting to axons
  BLOCK_CONNECT_AXON_3: 13,        // Block cell from connecting to axons
  ACCEPT_DENDRITES: 14,          // Neural cell accepts dendrites
  ACCEPT_DENDRITES_5: 15,          // Neural cell accepts dendrites
  BLOCK_ACCEPT_DENDRITES: 16,    // Blocks acceptance for dendrites
  BLOCK_ACCEPT_DENDRITES_5: 17,    // Blocks acceptance for dendrites
  DEVELOP_MOTOR_CELL: 18,        // Upon new cell division, this cell becomes motor cell
  DEVELOP_OPTICAL_CELL: 19,      // Upon cell division, the daughter cell becomes optical cell.
  START_CELL_DIVISION_B: 20,     // Another cell division
  START_CELL_DIVISION_C: 21,
  START_CELL_DIVISION_D: 22,     // Another cell division: 20,     // Another cell division
};

function Cell(id, parent, dna, proteins) {
  this.cellAge = 0;
  this.id = id;
  this.dna = dna;
  this.markedForDeath = false;
  this.proteins = proteins;   // this is the protein map - needs to be halved for the more realistic scenario.
  this.parentAnimal = parent;
  this.proteins[Proteins.REDUCES_PROTEINS] = 1;
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

  var proteinMix = calculateProteinMix(this.proteins);

  var gene = Math.floor(this.dna.length * proteinMix) - 1;
  if (gene < 0) gene = 0;
  debug("Gene " + gene + " with protein " + this.dna[gene] + " chosen by protein mix " + proteinMix);

  // Execute the action
  // TODO: Split this into two parts: first express the gene chosen, second act upon the proteins in the cell.

  // Expressing the genes
  switch(this.dna[gene]) {
    case Proteins.REDUCES_PROTEINS:
      this.proteins[Proteins.REDUCES_PROTEINS] = 1;
      break;
    case Proteins.START_CELL_DIVISION || Proteins.START_CELL_DIVISION_B || Proteins.START_CELL_DIVISION_C:
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
    default: debug("A gene with no rule for expressing has been found.");

  }

  // Now, do actions for all proteins found in the cell
  if (this.hasProtein(Proteins.REDUCES_PROTEINS)) {
    debug("Reducing proteins.");
    reduceProteinMix(this.proteins);
    this.proteins[Proteins.REDUCES_PROTEINS] -= 1;
  }

  if (this.hasProtein(Proteins.START_CELL_DIVISION)) {
    debug("Creating new cell!");
    //TODO: Reduce protein mix to half before spawing the cell.
    reduceProteinMix(this.proteins);
    this.proteins[Proteins.START_CELL_DIVISION] -= 1;

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
      this.proteins[Proteins.CONNECT_DENDRITES] -= 1;
      debug("Connecting dendrites");
    }

    if (this.hasProtein(Proteins.ACCEPT_DENDRITES)) {
      this.proteins[Proteins.ACCEPT_DENDRITES] -= 1;
      debug("Accepting dendrites");
    }

    if (this.hasProtein(Proteins.DICCONNECT_DENDRITES)) {
      this.proteins[Proteins.DISCONNECT_DENDRITES] -= 1;
      debug("Disconnecting dendrites");
    }

    if (this.hasProtein(Proteins.CONNECT_AXON)) {
      this.proteins[Proteins.CONNECT_AXON] -= 1;
      debug("Connecting Axon!");
    }

    if (this.hasProtein(Proteins.DEVELOP_MOTOR_CELL)) {
      debug("I'm a motor cell!");
    }

    if (this.hasProtein(Proteins.DEVELOP_OPTICAL_CELL)) {
      debug("I'm a optical cell!");
    }
  }

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

function reduceProteinMix(proteins) {
  Object.keys(proteins).forEach(function(key) {
    proteins[key] = proteins[key] / 2;
    if (proteins[key] < 1) delete proteins[key];
  });
}

function getProteinConcentration(protein) {
  //debug("Protein je: " + protein);
  if (protein !== undefined) return protein;
  else return 0;
}

module.exports = Cell;
