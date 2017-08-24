var id;
var dna;
var newCells = [];
var deadCells = [];
var Cell = require("./cell.js");
var debug = require('debug')('animal');
var health;

var dnaLength = Cell.ALL_PROTEINS_LENGTH;


function Animal(dna, id, parent) {
  this.dna = dna;
  this.id = id;
  this.world = parent;
  this.cells = [];
  this.cellsWithWillingDendrites = [];
  this.cellsAcceptingDendrites = [];
  this.neuralCells = [];
  this.opticalCells = [];
  this.motorCells = [];
  // Initiate the original cell to the original values
  this.health = 100;
  // Create the initial cell
  this.cells.push(new Cell(this.id + "_" + this.cells.length, this, this.dna, {}, 0));
}

Animal.prototype.tick = function() {
  // Express genes == grow the body
  //var tempFluidConcentration = 0;
  var that = this;
  this.newCells = [];
  this.deadCells = [];

  var that = this;
  this.cells.forEach(function(cell) {
    //debug("Ticking a cell with id: " + cell.id + ".");
    cell.tick();
  });

  //this.fluidConcentation += that.fluidConcentation / this.cells.length;


  debug("Removing " + this.deadCells.length + " cells, adding " + this.newCells.length + " cells.");
  this.newCells.forEach(function(cell) {
    that.cells.push(cell);
  });

  this.deadCells.forEach(function(cell) {
    var index = that.cells.indexOf(cell);
    if (index > -1) {
      debug("Found cell and splicing it.");
      that.cells.splice(index, 1);
    } else {
      debug("Did not find the cell - should not have happened!");
    }
  });

  // Check if this animal should die
  if (this.cells.length <= 0 || this.health <= 0) {
    debug("This animal is dead! Put it into removal bin.");
    var index = this.world.animals.indexOf(this);
    if (index > -1) {
      debug("Found the animal and splicing it.");
      this.world.animals.splice(index, 1);
      debug("Bye bye.");
      return;
    } else {
      debug("Did not find the animal - should not have happened!");
    }
  }

  //TODO: Reduce animal health every step - this will need to wait for a way to increase health somehow.

  // Adjust the cell connections - connect every willing cell with every willing dendrite
  this.cellsAcceptingDendrites.forEach(function(cell) {
    cell.addIncomingDendrites(that.cellsWithWillingDendrites);
    debug("Added " + that.cellsWithWillingDendrites.length + " to cell with id " + cell.id);
  });
  // Now wipe these two lists as we have added all needed connections
  this.cellsAcceptingDendrites = [];
  this.cellsWithWillingDendrites = [];

  // Now, all cells have ticked. Let's run the neural network.
  //var allInputGivingCells = this.neuralCells.concat(this.opticalCells);
  this.neuralCells.forEach(function(cell) {
    var sumOfInputs = 0;
    debug("Checking cell " + cell.id + " for firing. It has " + cell.incomingDendrites.length + " incoming dendrites.");
    cell.incomingDendrites.forEach(function(dendriteCell) {
      if (dendriteCell.isActive()) {
        debug("Found active input cell!");
        sumOfInputs += 1;
      }
    });
    //debug("Calculate sum of inputs: " + sumOfInputs);
    if (sumOfInputs > 0) debug("AJEEEE!!!!!!???==========================!!!!!!!!!!!!!!!!!!!!!!!!!===========__________________________-------------!");
    cell.setActive(sumOfInputs);
  });

  this.opticalCells.forEach(function(cell) {
      cell.setActive(199);
  });

  debug("Amimal " + this.id + " has " + this.cells.length + " cells, health of " + this.health + ".");
  debug("Above animal has " + this.neuralCells.length + " neural cells, " + this.opticalCells.length + " optical cells and " + this.motorCells.length + " motor cells.");
}

Animal.prototype.createNewCell = function(dna, proteins, cellType) {
  // Instead of adding cells immediately, we'll mark the ones that want to spawn and
  // add them to the animal in the end.
  var newCellName = this.id + "_" + (this.cells.length + this.newCells.length);
  debug("Adding a new cell with id " + newCellName + " to the animal.");
  this.newCells.push(new Cell(newCellName, this, dna, proteins, cellType));
}

Animal.prototype.addForRemoval = function(cell) {
  this.deadCells.push(cell);
}

Animal.prototype.addNeuralCell = function(cell) {
  this.neuralCells.push(cell);
}

Animal.prototype.addMotorCell = function(cell) {
  this.motorCells.push(cell);
}

Animal.prototype.addOpticalCell = function(cell) {
  this.opticalCells.push(cell);
}

Animal.prototype.addCellWithWillingDendrites = function(cell) {
  this.cellsWithWillingDendrites.push(cell);
}

Animal.prototype.addCellAcceptingDendrites = function(cell) {
  this.cellsAcceptingDendrites.push(cell);
}

module.exports = Animal;
