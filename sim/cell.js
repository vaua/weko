var dna;
var fluidConcentation;
var cellType;
var parentAnimal;
var openness;
var markedForDeath;
var debug = require('debug')('ex2:server');

function Cell(parent, dna, initialInnerLevel) {
  this.dna = dna;
  this.markedForDeath = false;
  this.innerLevel = initialInnerLevel;
  this.parentAnimal = parent;
  this.fluidConcentation = 0.5;
  this.openness = 0.5;
}

Cell.prototype.tick = function() {
  // Do what the DNA and outer and inner level tell you to do.
  //action = dna[innerLevel];

  var gene = Math.floor(this.dna.length * this.innerLevel);
  debug("Ticking... Chosen dna actions is " + gene + " with action " + this.dna[gene]);

  // Execute the action

  switch (this.dna[gene]) {
    case 1 : // duplicate
      debug("Creating new cell!")
      this.parentAnimal.createNewCell(this.innerLevel);
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
  }

  // Calculate new fluidConcentation
  this.fluidConcentation += (this.parentAnimal.fluidConcentation - this.fluidConcentation) * this.openness;
  debug("New fluidConcentation is " + this.fluidConcentation);

  // run the neural network, inputs, inter, outputs
}


module.exports = Cell;
