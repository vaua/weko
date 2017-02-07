var debug = require('debug')('world');
var Animal = require('./animal.js')

var tickNr = 0;
var INITIAL_ANIMAL_NUMBER = 10000;
var runForTicks = 100000;

function World() {
  this.animals = [];
}


World.prototype.start = function() {
  // Create the world
  // First the animals
  debug("Simulation started.");
  for (i = 0; i < INITIAL_ANIMAL_NUMBER; i++) {
    var dna = [];
    var dnaSize = Math.floor((Math.random() * 90) + 10);
    for (j = 0; j < dnaSize; j++) {
      dna.push(Math.floor((Math.random() * 20) + 1));
    }
    this.animals.push(new Animal(dna, i, this));
  }

  // Enter the eternal loop
  while(tickNr != runForTicks) {
    tickNr++;
    debug("Started world tick " + tickNr + " with " + this.animals.length + " animals in the world.");

    // Run all creatures and things in the universe
    this.animals.forEach(function(animal) {
      animal.tick();
    });

    // Report the situation to the all listening browsers.

  }
}



module.exports = World;
