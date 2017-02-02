var id;
var dna;
var cells = [];
var fluidConcentation;
var INTIAL_FLUID_CONCENTRATION = 0.5;
var Cell = require("./cell.js");
var debug = require('debug')('ex2:server');
var health;


function Animal(dna, id) {
  this.dna = dna;
  this.id = id;
  // Initiate the original cell to the original values
  this.fluidConcentation = INTIAL_FLUID_CONCENTRATION;
  this.health = 1000;
  // Create the initial cell
  cells.push(new Cell(this, this.dna, this.fluidConcentation));
}

Animal.prototype.tick = function() {
  // Express genes == grow the body
  var tempFluidConcentration = 0;

  cells.forEach(function(cell) {
    cell.tick();
    this.tempFluidConcentration += cell.fluidConcentation * cell.openness;
  });


  fluidConcentation = tempFluidConcentration / cells.length;
  // run the neural network, inputs, inter, outputs
  debug("Amimal " + this.id + " has " + cells.length + " cells and fluid concentration of " + this.fluidConcentation + ".");
}

Animal.prototype.createNewCell = function(fluidConcentation) {
  cells.push(new Cell(this, this.dna, fluidConcentation));
}

Animal.prototype.addForRemoval = function(cell) {
  var index = cells.indexOf(cell);
  if (index > -1) {
    cells.splice(index, 1);
  }
}


module.exports = Animal;
