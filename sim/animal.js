var id;
var dna;
var newCells = [];
var deadCells = [];
var Cell = require("./cell.js");
var debug = require('debug')('animal');
var health;

var dnaLength = Cell.ALL_PROTEINS_LENGTH;
var HEALTH_GAIN_WHEN_FOOD = 5;
var HEALTH_LOSS_WHEN_DANGER = 7;


function Animal(dna, id, position, world) {
  this.dna = dna;
  this.id = id;
  this.world = world;
  this.cells = [];
  this.cellsWithWillingDendrites = [];
  this.cellsAcceptingDendrites = [];
  this.neuralCells = [];
  this.opticalCells = [];
  this.motorCells = [];
  this.position = position;
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
    //debug("Added " + that.cellsWithWillingDendrites.length + " to cell with id " + cell.id);
  });
  // Now wipe these two lists as we have added all needed connections
  this.cellsAcceptingDendrites = [];
  this.cellsWithWillingDendrites = [];

  // Now, all cells have ticked. Let's run the neural network.
  //var allInputGivingCells = this.neuralCells.concat(this.opticalCells);
  this.neuralCells.forEach(function(cell) {
    var sumOfInputs = 0;
    //debug("Checking cell " + cell.id + " for firing. It has " + cell.incomingDendrites.length + " incoming dendrites.");
    cell.incomingDendrites.forEach(function(dendriteCell) {
      if (dendriteCell.isActive()) {
        //debug("Found active input cell!");
        sumOfInputs += 1;
      }
    });
    //debug("Calculate sum of inputs: " + sumOfInputs);
    if (sumOfInputs > 0) debug("This cell received " + sumOfInputs + " inputs!");
    cell.setActive(sumOfInputs);
  });

  // Get and decide optical inputs
  // Position: 0: food left, 1: danger left, 2: food right, 3: danger right.
  // Inputs get these values in order.
  var visualInput = this.world.getVisualInput();
  debug("Obtained visual input: " + visualInput);

  var i = 0;
  this.opticalCells.forEach(function(cell) {
    var rest = i%4;
    if (rest == 0) if (visualInput[0]%2 == 1) cell.setActive(199);  // Food left in field - this cell should be active.
    if (rest == 1) if (visualInput[0] > 1) cell.setActive(199);  // Danger left in field - thiss cell
    if (rest == 2) if (visualInput[1]%2 == 1) cell.setActive(199);  // Food left in field - this cell should be active.
    if (rest == 3) if (visualInput[1] > 1) cell.setActive(199);  // Danger left in field - thiss cell
    i+=1;
  });

  var activeCells = 0;
  this.opticalCells.forEach(function(cell) {
    if (cell.isActive()) activeCells += 1;
  });
  if (activeCells > 0 ) debug(activeCells + " of " + this.opticalCells.length + " optical cells are active!---------------------------------------");

  activeCells = 0;
  this.neuralCells.forEach(function(cell) {
    if (cell.isActive()) activeCells += 1;
  });
  if (activeCells > 0 ) debug(activeCells + " of " + this.neuralCells.length + " neural cells are active!========================================");

  activeCells = 0;
  this.motorCells.forEach(function(cell) {
    if (cell.isActive()) activeCells += 1;
  });

  if (activeCells > 0 ) debug(activeCells + " of " + this.motorCells.length + " motor cells are active!");

  // Move the animal

  // Apply the food / danger
  if (this.position == 0) {
    // We're on the left side. We shouls still have visualInput as a variable
    if (visualInput[0] % 2 == 1) this.health += HEALTH_GAIN_WHEN_FOOD; // Food was in the left area.
    if (visualInput[0] > 1) this.health -= HEALTH_LOSS_WHEN_DANGER; // Danger was in the left area.
  } else if (this.position == 1 ) {
    if (visualInput[1] % 2 == 1) this.health += HEALTH_GAIN_WHEN_FOOD; // Food was in the right area.
    if (visualInput[1] > 1) this.health -= HEALTH_LOSS_WHEN_DANGER; // Danger was in the right area.
  } else {
    debug("The position is neither 0 or 1 but " + this.position + ". Error!");
  }


  debug("Animal " + this.id + " has " + this.cells.length + " cells, health of " + this.health + ".");
  debug("Finishing the animal that has " + this.neuralCells.length + " neural cells, " + this.opticalCells.length + " optical cells and " + this.motorCells.length + " motor cells.");
}

Animal.prototype.createNewCell = function(dna, proteins, cellType) {
  // Instead of adding cells immediately, we'll mark the ones that want to spawn and
  // add them to the animal in the end.
  var newCellName = this.id + "_" + (this.cells.length + this.newCells.length);
  //debug("Adding a new cell with id " + newCellName + " to the animal.");
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
