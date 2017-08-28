var id;
var dna;
var parentAnimal;
var markedForDeath;
var debug = require('debug')('cell');
var proteins = {};
var cellAge;
var cellType;
var active;
var AGE_WHEN_CELL_CAN_DIE = 100;
var RISK_OF_CELL_DEATH_OF_OLD_AGE = 0.02
var NEURON_FIRING_THRESHOLD = 1;

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
var SPAWN_ANIMAL_START = OPTICAL_CELL_START + OPTICAL_CELL_LENGTH;
var SPAWN_ANIMAL_LENGTH = 10;
var NO_PROTEIN_START = SPAWN_ANIMAL_START + SPAWN_ANIMAL_LENGTH;
var NO_PROTEIN_LENGTH = 10;

ALL_PROTEINS_LENGTH = NO_PROTEIN_START + NO_PROTEIN_LENGTH;



var Proteins = {
  REDUCES_PROTEINS :        REDUCTION_START,                 // 0, Reduces the number of all proteins to half (but does not affect permanen proteins)
  START_CELL_DIVISION :     DIVISION_START,                  // 1, If this protein is expressed, the cell will devide itself
  NEURON :                  NEURON_START,                    // 11, Cell will get an axon that will connect to all at that time receptive axons. Permanent, makes cell neural cell.
  CONNECT_DENDRITES:        CONNECT_DENDRITES_START,         // 21, Neural cell will connect its axon to currently receptive dendrites
  DISCONNECT_DENDRITES:     DISCONNECT_DENDRITES_START,      // 26, Neural cell will disconnect X least used dendrites.
  BLOCK_CONNECT_DENDRITES:  BLOCK_CONNECT_DENDRITES_START,   // Blockerar protein that connects dendrites.
  CONNECT_AXON:             CONNECT_AXON_START,              // Neural cell connects to all receptive axons
  BLOCK_CONNECT_AXON:       BLOCK_CONNECT_AXON_START,        // Block cell from connecting to axons
  ACCEPT_DENDRITES:         ACCEPT_DENDRITES_START,          // Neural cell accepts dendrites
  BLOCK_ACCEPT_DENDRITES:   BLOCK_ACCEPT_DENDRITES_START,    // Blocks acceptance for dendrites
  DEVELOP_MOTOR_CELL:       MOTOR_CELL_START,                // Upon new cell division, this cell becomes motor cell
  DEVELOP_OPTICAL_CELL:     OPTICAL_CELL_START,              // Upon cell division, the daughter cell becomes optical cell.
  SPAWN_ANIMAL:				SPAWN_ANIMAL_START
};

var CellTypes = {
  NONE : 0,
  NEURON : 1,
  MOTOR: 2,
  OPTICAL: 3
}

function Cell(id, parent, dna, proteins, cellType) {
  this.cellAge = 0;
  this.id = id;
  this.dna = dna;
  this.markedForDeath = false;
  this.proteins = proteins;   // this is the protein map - needs to be halved for the more realistic scenario.
  this.parentAnimal = parent;
  this.positionInDna = 0;
  this.cellType = cellType;
  this.active = false;
  this.incomingDendrites = [];
  debug("New cell is born with name: " + this.id + " and cell type " + this.cellType);

  // Handle neural cells
  if (this.cellType > 0) {  // TODO: Fix this ugly shortcut comparison to proper cell type check
    debug("We got ourselves a cool neural extended cell!");
    if (this.cellType === CellTypes.NEURON) {
      this.parentAnimal.addNeuralCell(this);
    }

    if (this.cellType === CellTypes.MOTOR) {
      this.parentAnimal.addMotorCell(this);
    }

    if (this.cellType === CellTypes.OPTICAL) {
      this.parentAnimal.addOpticalCell(this);
    }
  }
  //debug("DNA is: " + this.dna);
}

/**
* Checks whether a protein is contained in the cell at the given time.
*/
Cell.prototype.hasProtein = function(protein) {
    //debug("Checking if protein" + protein + " exists in the cell.");

    if (this.proteins.hasOwnProperty(protein)) {
      //debug("Protein is in the cell with concentration " + this.proteins[protein]);
      return this.proteins[protein] >= 1;
    }
    else return false;
}

Cell.prototype.addIncomingDendrites = function(dendrites) {
  this.incomingDendrites.push(...dendrites);
}

Cell.prototype.isActive = function() {
  return this.active;
}

Cell.prototype.setActive = function(activeInputs) {
  if (activeInputs > NEURON_FIRING_THRESHOLD) {
    this.active = true;
    debug("Cell is firing.");
  }
  else {
    this.active = false;
  }
}

/**
* Main function executed for the cell on every tick.
*/
Cell.prototype.tick = function() {
  var that = this;
  this.cellAge += 1;
  this.active = false;
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

    // Expressing the genes
    var proteinExpressed = this.dna[this.positionInDna];

    // Nested if-statements checking which protein has been expressed.
    if (proteinExpressed < DIVISION_START) { // REDUCTION is expressed.
		addProteinIntoTheMix(this.proteins, Proteins.REDUCES_PROTEINS, 1);
    } else if (proteinExpressed < NEURON_START) {
		addProteinIntoTheMix(this.proteins, Proteins.START_CELL_DIVISION, (proteinExpressed - DIVISION_START) + 1);
		debug('division.');
    } else if (proteinExpressed < CONNECT_DENDRITES_START) {
		addProteinIntoTheMix(this.proteins, Proteins.NEURON, 1);
		debug("Neuron");
    } else if (proteinExpressed < DISCONNECT_DENDRITES_START) {
		addProteinIntoTheMix(this.proteins, Proteins.CONNECT_DENDRITES, (proteinExpressed - CONNECT_DENDRITES_START) + 1);
		debug("Connect dendrites");
    } else if (proteinExpressed < BLOCK_CONNECT_DENDRITES_START) {
		addProteinIntoTheMix(this.proteins, Proteins.DISCONNECT_DENDRITES, (proteinExpressed - DISCONNECT_DENDRITES_START) + 1);
		debug("Disconnect dendrites");
    } else if (proteinExpressed < CONNECT_AXON_START) {
		addProteinIntoTheMix(this.proteins, Proteins.BLOCK_CONNECT_DENDRITES, (proteinExpressed - BLOCK_CONNECT_DENDRITES_START) + 1);
		debug("Block conect dendrites");
    } else if (proteinExpressed < BLOCK_CONNECT_AXON_START) {
		addProteinIntoTheMix(this.proteins, Proteins.CONNECT_AXON, (proteinExpressed - CONNECT_AXON_START) + 1);
		debug("Axon start");
    } else if (proteinExpressed < ACCEPT_DENDRITES_START) {
		addProteinIntoTheMix(this.proteins, Proteins.BLOCK_CONNECT_AXON, (proteinExpressed - BLOCK_CONNECT_AXON_START) + 1);
		debug("Block connect axon");
    } else if (proteinExpressed < BLOCK_ACCEPT_DENDRITES_START) {
		addProteinIntoTheMix(this.proteins, Proteins.ACCEPT_DENDRITES, (proteinExpressed - ACCEPT_DENDRITES_START) + 1);
		debug("Accept dendrites start");
    } else if (proteinExpressed < MOTOR_CELL_START) {
		addProteinIntoTheMix(this.proteins, Proteins.BLOCK_ACCEPT_DENDRITES, (proteinExpressed - BLOCK_ACCEPT_DENDRITES_START) + 1);
		debug("Block accept dendrites");
    } else if (proteinExpressed < OPTICAL_CELL_START) {
		addProteinIntoTheMix(this.proteins, Proteins.DEVELOP_MOTOR_CELL, (proteinExpressed - MOTOR_CELL_START) + 1);
		debug("Motor cell");
    } else if (proteinExpressed < SPAWN_ANIMAL_START) {
		addProteinIntoTheMix(this.proteins, Proteins.DEVELOP_OPTICAL_CELL, (proteinExpressed - OPTICAL_CELL_START) + 1);
		debug("Optical cell");
    } else if (proteinExpressed < NO_PROTEIN_START) {
		addProteinIntoTheMix(this.proteins, Proteins.SPAWN_ANIMAL, 1);
		debug("Spawning new animal.");
    }
  } else {
    debug("The DNA position " + this.positionInDna + " is outside of the size od DNA. No protein was expressed.");
  }

  // increase positionInDna
  this.positionInDna += 1;

  if (this.hasProtein(Proteins.NEURON) && this.cellType == CellTypes.NONE) {
    debug("I am a neuron cell!");
    this.cellType = CellTypes.NEURON;
  }
  
  
  if (this.hasProtein(Proteins.SPAWN_ANIMAL)) {
    debug("Spawning!");
    debug("First, create a new cell!");
    //TODO: Reduce protein mix to half before spawing the cell.
    reduceProteinMixByHalf(this.proteins);

    // copy the proteins, TODO: reduce the number
    var newCellProtein = {};
    Object.keys(this.proteins).forEach(function(key) {
      newCellProtein[key] = that.proteins[key];
    });
    this.parentAnimal.spawnNewAnimal(this.dna, this.proteins, this.cellType);
    this.parentAnimal.health -= 10; // Reduce the health upon birth, significantly
  }

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
    this.parentAnimal.createNewCell(this.dna, this.proteins, this.cellType);
    this.parentAnimal.health -= 1; // Reduce the health upon birth
  }

  //TODO: Some of the checks in here will need to be splitted out for optical, motor cells.
  if (this.cellType > CellTypes.NONE) {
    if (this.hasProtein(Proteins.CONNECT_DENDRITES) && this.cellType != CellTypes.MOTOR) {  // Motor cell has no dendrites - its firing affects the movement
      debug("Connecting dendrites");
      this.parentAnimal.addCellWithWillingDendrites(this);
    }

    if (this.hasProtein(Proteins.ACCEPT_DENDRITES) && this.cellType != CellTypes.OPTICAL) { // Optical cells need no incoming dendrites - they are driven by inputs directly
      debug("Accepting dendrites");
      this.parentAnimal.addCellAcceptingDendrites(this);
    }

    if (this.hasProtein(Proteins.DICCONNECT_DENDRITES)) {
      debug("Disconnecting dendrites");
      //TODO: Implement
    }

    if (this.hasProtein(Proteins.CONNECT_AXON)) {
      debug("Connecting Axon!");
      //TODO: Most likely remove.
    }

    if (this.hasProtein(Proteins.DEVELOP_MOTOR_CELL) && (this.cellType == CellTypes.NEURON)) { // If this is plane neuron, now it will become motor cell
      debug("I'm a motor cell now!");
      this.cellType = CellTypes.MOTOR;
    }

    if (this.hasProtein(Proteins.DEVELOP_OPTICAL_CELL) && (this.cellType == CellTypes.NEURON)) { // If this is a plane neuron, now it will become optical cell
      debug("I'm an optical cell now!");
      this.cellType = CellTypes.OPTICAL;
    }
  }

  // Once done with all actions, reduce all protein concentrations by 1
  reduceProteinMixByOne(this.proteins);

  // run the neural network, inputs, inter, outputs
}

/**
* Adds specified amount of a specified protein into the cell protein mix.
*/
function addProteinIntoTheMix(proteins, protein, amount) {
	if (proteins.hasOwnProperty(protein)) {
		proteins[protein] += amount;
	}
    else proteins[protein] = amount;
  debug("Added protein " + protein + " amount of " + amount);
}

/**
* Reduces the protein mix by half, rounding up. Useful when splitting up the cell.
*/
function reduceProteinMixByHalf(proteins) {
  Object.keys(proteins).forEach(function(key) {
    proteins[key] = proteins[key] / 2;
    if (proteins[key] < 1) delete proteins[key];
  });
}

/**
* Reduces protein mix by one. Useful on every tick. Should not affect the "permanent" proteins, like neuron_protein.
*/
function reduceProteinMixByOne(proteins) {
  Object.keys(proteins).forEach(function(key) {
    if (proteins[key] > 1) proteins[key] -= 1;
    if (proteins[key] < 1) delete proteins[key];
  });
}

/**
* Returns the concentration of some protein in the cell (amount)
*/
function getProteinConcentration(protein) {
  //debug("Protein je: " + protein);
  if (protein !== undefined) return protein;
  else return 0;
}

module.exports = Cell;
