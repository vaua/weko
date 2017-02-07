var debug = require('debug')('world');
var Animal = require('./animal.js')

var tickNr = 0;
var INITIAL_ANIMAL_NUMBER = 10;
var animals = [];
var runForTicks = 10;

exports.start = function() {
  debug("Simulation started.");

  // Create the world
  // First the animals
  for (i = 0; i < INITIAL_ANIMAL_NUMBER; i++) {
    var dna = [];
    var dnaSize = Math.floor((Math.random() * 90) + 10);
    for (j = 0; j < dnaSize; j++) {
      dna.push(Math.floor((Math.random() * 20) + 1));
    }
    animals.push(new Animal(dna, i, this));
  }

  // Enter the eternal loop
  while(tickNr != runForTicks) {
    tickNr++;
    debug("Started world tick " + tickNr);

    // Run all creatures and things in the universe
    animals.forEach(function(animal) {
      animal.tick();
    });

    // Report the situation to the all listening browsers.

  }
}
