var id;
var dna;
var cells = [];
var newCells = [];
var deadCells = [];
var fluidConcentation;
var INTIAL_FLUID_CONCENTRATION = 0.5;
var Cell = require("./cell.js");
var debug = require('debug')('animal');
var health;


function Animal(dna, id, parent) {
  this.dna = dna;
  this.id = id;
  this.world = parent;
  this.cells = [];
  // Initiate the original cell to the original values
  this.fluidConcentation = INTIAL_FLUID_CONCENTRATION;
  this.health = 100;
  // Create the initial cell
  this.cells.push(new Cell(this.id + "_" + this.cells.length, this, this.dna, this.fluidConcentation));
}

Animal.prototype.tick = function() {
  // Express genes == grow the body
  var tempFluidConcentration = 0;
  this.newCells = [];
  this.deadCells = [];

  var that = this;
  this.cells.forEach(function(cell) {
    debug("Ticking a new cell with id: " + cell.id + ".");
    cell.tick();
    that.tempFluidConcentration += cell.fluidConcentation * cell.openness;
  });


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

  fluidConcentation = tempFluidConcentration / cells.length;
  // run the neural network, inputs, inter, outputs
  debug("Amimal " + this.id + " has " + this.cells.length + " cells, health of " + this.health + " and fluid concentration of " + this.fluidConcentation + ".");
}

Animal.prototype.createNewCell = function(fluidConcentation) {
  // Instead of adding cells immediately, we'll mark the ones that want to spawn and
  // add them to the animal in the end.
  debug("Adding a new cell with id " + this.id + "_" + (this.cells.length + this.newCells.length) + " to the animal.");
  this.newCells.push(new Cell(this.id + "_" + (this.cells.length + this.newCells.length), this, this.dna, fluidConcentation));

}

Animal.prototype.addForRemoval = function(cell) {
  this.deadCells.push(cell);
}


module.exports = Animal;
