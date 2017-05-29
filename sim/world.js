var debug = require('debug')('world');
var Animal = require('./animal.js')

var tickNr = 0;
var INITIAL_ANIMAL_NUMBER = 10000;
var runForTicks = 100000;
var HORIZON = 3;
var WORLD_WIDTH = 2;
var CHANCE_OF_FOOD = 0.1;
var RISK_OF_DANGER = 0.1;


function World() {
  this.animals = [];
  this.visibleLocations = [];
  this.pointerToView = 0;
  this.visualInput = [];
}

function transformLocationsIntoVisualInput(locations) {
	var visualInput = [];

	debug("Locations: " + locations);
	for (i = 0; i < HORIZON; i++) {
		var locationLayer = locations[i];
		// Check for danger
		if (locationLayer[0] == 2 || locationLayer[0] == 3) {
			visualInput[i * WORLD_WIDTH] = 1; 
		}  else {
			visualInput[i * WORLD_WIDTH] = 0; 
		}
		if (locationLayer[1] == 2 || locationLayer[0] == 3) {
			visualInput[i * WORLD_WIDTH + 1] = 1; 
		}  else {
			visualInput[i * WORLD_WIDTH + 1] = 0; 
		}

		// Check for food
		if (locationLayer[0] == 1 || locationLayer[0] == 3) {
			visualInput[i * WORLD_WIDTH + 2] = 1; 
		}  else {
			visualInput[i * WORLD_WIDTH + 2] = 0; 
		}
		if (locationLayer[1] == 1 || locationLayer[0] == 3) {
			visualInput[i * WORLD_WIDTH + 3] = 1; 
		}  else {
			visualInput[i * WORLD_WIDTH + 3] = 0; 
		}
	}
	return visualInput;
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
  // Populate the view with food and danger
  for (i = 0; i < HORIZON; i++) {
    oneRow = [];
    for (j = 0; j < WORLD_WIDTH; j++) {
      if (Math.random() < CHANCE_OF_FOOD) {
        oneRow[j] = 1;
      }
      else {
        oneRow[j] = 0;
      }
      if (Math.random() < RISK_OF_DANGER) oneRow[j] += 2;
    }
    this.visibleLocations[i] = oneRow;
  }
  this.visualInput = transformLocationsIntoVisualInput(this.visibleLocations);
  debug("Visible locations: " + this.visibleLocations);

  // Enter the eternal loop
  while(tickNr != runForTicks) {
    tickNr++;
    debug("Started world tick " + tickNr + " with " + this.animals.length + " animals in the world.");

    debug("First row: " + this.visibleLocations[this.pointerToView][0] + "," + this.visibleLocations[this.pointerToView][1]);
	debug("Visual input is: " + this.visualInput);
	
    // Run all creatures and things in the universe
    this.animals.forEach(function(animal) {
      animal.tick();
    });

    // Report the situation to the all listening browsers.

    // create new food at the current locations
    oneRow = [];
    for (j = 0; j < WORLD_WIDTH; j++) {
      if (Math.random() < CHANCE_OF_FOOD) {
        oneRow[j] = 1;
      }
      else {
        oneRow[j] = 0;
      }
      if (Math.random() < RISK_OF_DANGER) oneRow[j] += 2;
    }
	
    this.visibleLocations[this.pointerToView] = oneRow;
    // Increase the pointerToView
    this.pointerToView = (this.pointerToView + 1) % HORIZON;
	this.visualInput = transformLocationsIntoVisualInput(this.visibleLocations);
  }
}



module.exports = World;
