var id;
var dna;
var fluidConcentation;
var cellType;
var parentAnimal;
var openness;
var markedForDeath;
var debug = require('debug')('cell');
var cellProteins = {};

var Proteins = {
  REDUCES_PROTEINS_1 : 0,          // Reduces the number of all proteins to half (but does not affect permanen proteins)
  START_CELL_DIVISION_1 : 1,       // If this protein is expressed, the cell will devide itself
  NEURON_0 : 2,                    // Cell will get an axon that will connect to all at that time receptive axons. Permanent, makes cell neural cell.
  CONNECT_DENDRITES_1: 3,          // Neural cell will connect its axon to currently receptive dendrites
  DISCONNECT_DENDRITES_1: 4,       // Neural cell will disconnect X least used dendrites.
  DISCONNECT_DENDRITES_3: 5,       // Neural cell will disconnect X least used dendrites.
  DISCONNECT_DENDRITES_5: 6,       // Neural cell will disconnect X least used dendrites.
  BLOCK_CONNECT_DENDRITES_1: 7,    // Blockerar protein that connects dendrites.
  BLOCK_CONNECT_DENDRITES_3: 8,    // Blockerar protein that connects dendrites.
  BLOCK_CONNECT_DENDRITES_5: 9,    // Blockerar protein that connects dendrites.
  CONNECT_AXON_1: 10,              // Neural cell connects to all receptive axons
  CONNECT_AXON_5: 11,              // Neural cell connects to all receptive axons
  BLOCK_CONNECT_AXON_1: 12,        // Block cell from connecting to axons
  BLOCK_CONNECT_AXON_3: 13,        // Block cell from connecting to axons
  ACCEPT_DENDRITES_1: 14,          // Neural cell accepts dendrites
  ACCEPT_DENDRITES_5: 15,          // Neural cell accepts dendrites
  BLOCK_ACCEPT_DENDRITES_1: 16,    // Blocks acceptance for dendrites
  BLOCK_ACCEPT_DENDRITES_5: 17,    // Blocks acceptance for dendrites
  DEVELOP_MOTOR_CELL_0: 18,        // Upon new cell division, this cell becomes motor cell
  DEVELOP_OPTICAL_CELL_0: 19,      // Upon cell division, the daughter cell becomes optical cell.
};

function Cell(id, parent, dna, initialInnerLevel) {
  this.id = id;
  this.dna = dna;
  this.markedForDeath = false;
  this.innerLevel = initialInnerLevel;   // this is the fluid concentration
  this.parentAnimal = parent;
  this.openness = 0.5;
  debug("New cell is born with name: " + this.id);
}

Cell.prototype.tick = function() {
  // Do what the DNA and outer and inner level tell you to do.
  //action = dna[innerLevel];
  var that = this;


  var changeInnerLevel = function (amount) {
    debug("Inner level before: " + that.innerLevel + ", change: " + amount);
    that.innerLevel += amount;
    if (that.innerLevel > 1) that.innerLevel = 1;
    if (that.innerLevel < 0) that.innerLevel = 0;
    debug("Inner level after: " + that.innerLevel);
  }

  var gene = Math.floor(this.dna.length * this.innerLevel);
  debug("Cell " + this.id + ": Gene " + gene + " with action " + this.dna[gene] + " chosen by fluid level " + this.innerLevel);

  // Execute the action

  switch (this.dna[gene]) {
    case 1 : // duplicate
      debug("Creating new cell!")
      this.parentAnimal.createNewCell(this.innerLevel);
      this.parentAnimal.health -= 1; // Reduce the health upon birth
      break;
    case 2: // Increase the openness
      this.openness += 0.1;
      if (this.openness > 1) this.openness = 1;
      break;
    case 3: // decrease the openness
      this.openness -= 0.1;
      if (this.openness < 0) this.openness = 0;
      break;
    case 4: // die
      markedForDeath = true;
      debug("Cell dying!");
      this.parentAnimal.addForRemoval(this);
      break;
    case 5: // create new cell and increase concentration
      debug("Creating new cell and increasing concentration by 0,2!")
      this.parentAnimal.createNewCell(this.innerLevel);
      changeInnerLevel(0.2);
      this.parentAnimal.health -= 1; // Reduce the health
      break;
    case 6: // create new cell and decrease concentration
      debug("Creating new cell and decreasing concentration by 0,2!")
      this.parentAnimal.createNewCell(this.innerLevel);
      changeInnerLevel(-0.2);
      this.parentAnimal.health -= 1; // Reduce the health
      break;
    case 7: // create new cell and increase concentration
      debug("Increasing concentration by 0,1!")
      changeInnerLevel(0.1);
      break;
    case 8: // create new cell and decrease concentration
      debug("Decreasing concentration by 0,1!")
      changeInnerLevel(-0.1);
      break;
  }

  // Calculate new fluidConcentation
  changeInnerLevel((this.parentAnimal.fluidConcentation - this.innerLevel) * this.openness);
  debug("New innerLevel is " + this.innerLevel);

  // run the neural network, inputs, inter, outputs

}



module.exports = Cell;
