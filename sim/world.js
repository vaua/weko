var debug = require('debug')('world');
var Animal = require('./animal.js')

var tickNr = 0;
var MINIMAL_ANIMAL_NUMBER = 30;
var runForTicks = 150;
var HORIZON = 3;
var DNA_MIN_SIZE = 10;
var DNA_MAX_SIZE = 400;
var WORLD_WIDTH = 2;
var CHANCE_OF_FOOD = 0.3;
var RISK_OF_DANGER = 0.3;
var NUMBER_OF_PROTEINS = ALL_PROTEINS_LENGTH;


function World() {
  this.animals = [];
  this.visibleLocations = [];
  this.pointerToView = 0;
  this.visualInput = [];
  this.animalId = 0;
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
		if (locationLayer[1] == 2 || locationLayer[1] == 3) {
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
		if (locationLayer[1] == 1 || locationLayer[1] == 3) {
			visualInput[i * WORLD_WIDTH + 3] = 1;
		}  else {
			visualInput[i * WORLD_WIDTH + 3] = 0;
		}
	}
	return visualInput;
}

World.prototype.getVisualInput = function() {
  return this.visibleLocations[this.pointerToView];
}

World.prototype.createAnimal = function(initialCell, position) {
	this.animals.push(new Animal(initialCell, this.animalId++, position, this));
}

World.prototype.createRandomAnimals = function(numberOfAnimalsToCreate) {
  for (i = 0; i < numberOfAnimalsToCreate; i++) {
    var dna = [];
    var dnaSize = Math.floor((Math.random() * DNA_MAX_SIZE) + DNA_MIN_SIZE);
    for (j = 0; j < dnaSize; j++) {
      dna.push(Math.floor((Math.random() * NUMBER_OF_PROTEINS) + 1));
    }
    var place = Math.floor(Math.random() * WORLD_WIDTH);
    this.animals.push(new Animal(dna, this.animalId++, place, this));
  }
}

World.prototype.start = function() {
  // Create the world
  // First the animals
  debug("Simulation started.");

  // Here, special animals are added.
  // specialDna = [6, 7, 12, 6, 17, 7, 1, 8, 8, 8, 1, 8, 8, 8 ,8 ,8 ,8 ,8 ,8 ,7, 6];
  // this.animals.push(new Animal(specialDna, INITIAL_ANIMAL_NUMBER, this));

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
    // Now, catch up to the minimal animal level
    if (this.animals.length < MINIMAL_ANIMAL_NUMBER) {
      debug("Will create " + (MINIMAL_ANIMAL_NUMBER - this.animals.length) + " new animals.");
	  this.createRandomAnimals(MINIMAL_ANIMAL_NUMBER - this.animals.length);
    }

    //debug("First row: " + this.visibleLocations[this.pointerToView][0] + "," + this.visibleLocations[this.pointerToView][1]);
	  //debug("Visual input is: " + this.visualInput);

    // Check if no animals left, exit
    if (this.animals.length < 1) {
      break;
    }

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
  debug("Visible localtions: " + this.visibleLocations);
  debug("Visual input is: " + this.visualInput);
  }
}



module.exports = World;
