var debug = require('debug')('world');
var Animal = require('./animal.js')

var runForTicks = 150;
var HORIZON = 3;
var DNA_MIN_SIZE = 10;
var DNA_MAX_SIZE = 400;
var WORLD_WIDTH = 2;
var CHANCE_OF_FOOD = 0.3;
var RISK_OF_DANGER = 0.3;
var NUMBER_OF_PROTEINS = ALL_PROTEINS_LENGTH;


function World() {
  this.tickNr = 0;
  this.animals = [];
  this.minimalAnimalNumber = 1;
  this.animalReport = {};
  this.visibleLocations = [];
  this.pointerToView = 0;
  this.visualInput = [];
  this.animalId = 0;
  this.result = {};
  this.totalFirings = 0;
  this.left = 0;
  this.right = 0;
  this.dnaHallOfFame = {}; // Currenly object, animal id, age, acquiered points and DNA

  //Comment - how to do DNA for new animals
  // Point system, upon death.
  // 1. Moving, to food / away from danger. If  >50% of moves are towards food, away from danger, than this is awarded.
  // 2. Moving at all.
  // 3. Firing Neurons.
  // 4. Age at death - if more than 70.


  // prepare the world
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
	this.animals.push(new Animal(initialCell.dna, this.animalId++, position, this, initialCell));
}

World.prototype.createAnimals = function(numberOfAnimalsToCreate) {
  for (i = 0; i < numberOfAnimalsToCreate; i++) {
    var dna = [];
    var type = Math.random();
    var ancestor;

    if ((this.dnaHallOfFame.dna === undefined) || (type < 0.5)) { // do random animal
      var dnaSize = Math.floor((Math.random() * DNA_MAX_SIZE) + DNA_MIN_SIZE);
      for (j = 0; j < dnaSize; j++) {
        dna.push(Math.floor((Math.random() * NUMBER_OF_PROTEINS) + 1));
      }
    } else {
      dna = this.dnaHallOfFame.dna;
      ancestor = this.dnaHallOfFame.id;
      debug("Created copied animal, " + (this.animalId + 1) + " is clone of " + this.dnaHallOfFame.id);
    }

    var place = Math.floor(Math.random() * WORLD_WIDTH);
    this.animals.push(new Animal(dna, this.animalId++, place, this, undefined, ancestor));
  }
}

World.prototype.reportAnimal = function(report) {
  this.animalReport[report.id] = report;
  this.totalFirings += report.totalFirings;
}

World.prototype.tick = function() {
  this.tickNr++;
  debug("Started world tick " + this.tickNr + " with " + this.animals.length + " animals in the world.");
  this.animalReport = {};
  // Now, catch up to the minimal animal level
  if (this.animals.length < this.minimalAnimalNumber) {
    debug("Will create " + (this.minimalAnimalNumber - this.animals.length) + " new animals.");
  this.createAnimals(this.minimalAnimalNumber - this.animals.length);
  }

  //debug("First row: " + this.visibleLocations[this.pointerToView][0] + "," + this.visibleLocations[this.pointerToView][1]);
  //debug("Visual input is: " + this.visualInput);

  // Check if no animals left, exit
  if (this.animals.length < 1) {
    return;
  }

  // Run all creatures and things in the universe
  this.animals.forEach(function(animal) {
    if (animal === undefined) console.log("Found an unind");
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

  debug("Sending the socket!");
  this.result.tickNr = this.tickNr;
  this.result.animalNr = this.animals.length;
  this.result.visualInput = this.visibleLocations[this.pointerToView];
  this.result.animalReport = this.animalReport;
  this.result.totalFirings = this.totalFirings;
  this.result.left = this.left;
  this.result.right = this.right;
}

/*
World.prototype.start = function(minAnimals, ticks) {
  // Create the world
  // First the animals
  debug("Simulation started.");

  if (minAnimals !== undefined) MINIMAL_ANIMAL_NUMBER = minAnimals;
  if (ticks !== undefined) runForTicks = ticks;
  // Here, special animals are added.
  // specialDna = [6, 7, 12, 6, 17, 7, 1, 8, 8, 8, 1, 8, 8, 8 ,8 ,8 ,8 ,8 ,8 ,7, 6];
  // this.animals.push(new Animal(specialDna, INITIAL_ANIMAL_NUMBER, this));



  // Enter the eternal loop
  while(this.tickNr != runForTicks) {
    this.tick();

  }
}
*/


module.exports = World;
