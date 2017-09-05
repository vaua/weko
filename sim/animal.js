var Cell = require("./cell.js");
var debug = require('debug')('animal');

var dnaLength = Cell.ALL_PROTEINS_LENGTH;
var HEALTH_GAIN_WHEN_FOOD = 5;
var HEALTH_LOSS_WHEN_DANGER = 7;


function Animal(dna, id, position, world, initialCell) {
  this.dna = dna;
  this.id = id;
  this.age = 0;
  this.world = world;
  this.cells = [];
  this.newCells = [];
  this.deadCells = [];
  this.cellsWithWillingDendrites = [];
  this.cellsAcceptingDendrites = [];
  this.neuralCells = [];
  this.opticalCells = [];
  this.motorCells = [];
  this.position = position;
  this.totalNeuralMotorFirings = 0;
  this.moves = 0;
  // Initiate the original cell to the original values
  this.health = 100;
  // Create the initial cell
  if (initialCell === undefined) {
	this.cells.push(new Cell(this.id + "_" + this.cells.length, this, this.dna, {}, 0));
  } else {
	initialCell.id = this.id + "_" + this.cells.length;
	initialCell.parent = this;
	if (initialCell.cellType == CellTypes.NEURON) {
		this.neuralCells.push(initialCell);
	} else if (initialCell.cellType == CellTypes.OPTICAL) {
		this.opticalCells.push(initialCell);
	} else if (initialCell.cellType == CellTypes.MOTOR) {
		this.motorCells.push(initialCell);
	}

	this.cells.push(initialCell);
  }
}



Animal.prototype.tick = function() {

  var that = this;
  this.newCells = [];
  this.deadCells = [];
  this.age++;


  this.cells.forEach(function(cell) {
    //debug("Ticking a cell with id: " + cell.id + ".");
	if (cell === undefined) debug("The cell is undefined.");
	else debug("Running cell " + cell.id);
    cell.tick();
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

  // Adjust the cell connections - connect every willing cell with every willing dendrite
  this.cellsAcceptingDendrites.forEach(function(cell) {
    cell.addIncomingDendrites(that.cellsWithWillingDendrites);
    //debug("Added " + that.cellsWithWillingDendrites.length + " to cell with id " + cell.id);
  });
  // Now wipe these two lists as we have added all needed connections
  this.cellsAcceptingDendrites = [];
  this.cellsWithWillingDendrites = [];

  // Now, all cells have ticked. Let's run the neural network.
  //WHAT IS THIS?? NEEDED? var allInputGivingCells = this.neuralCells.concat(this.opticalCells);


  // Get inputs from the world and set optical cells.
  // Position: 0: food left, 1: danger left, 2: food right, 3: danger right.
  // Inputs get these values in order.
  var nodes = [];
  var edges = [];
  var visualInput = this.world.getVisualInput();
  debug("Obtained visual input: " + visualInput);

  var i = 0;
  this.opticalCells.forEach(function(cell) {
    // Add cell to the nodes
    var cell_description = {};
    cell_description.id = cell.id;
    cell_description.label = cell.id;
    cell_description.color = "yellow";
    nodes.push(cell_description);
    // There are four options in the world - every forth optical cell react to specific thing.
    var rest = i%4;
    if (rest == 0) if (visualInput[0]%2 == 1) cell.setActive(199);  // Food left in field - this cell should be active.
    if (rest == 1) if (visualInput[0] > 1) cell.setActive(199);  // Danger left in field - thiss cell
    if (rest == 2) if (visualInput[1]%2 == 1) cell.setActive(199);  // Food right in field - this cell should be active.
    if (rest == 3) if (visualInput[1] > 1) cell.setActive(199);  // Danger right in field - thiss cell
    i+=1;
  });

  var totalInputs = 0;
  var totalDendrites = 0;

  // Now that optical cells have been set, calculate the pure neural cells.
  this.neuralCells.forEach(function(cell) {
    // Add cell to the nodes
    var cell_description = {};
    cell_description.id = cell.id;
    cell_description.label = cell.id;
    cell_description.color = "blue";
    nodes.push(cell_description);

    var sumOfInputs = 0;
    cell.incomingDendrites.forEach(function(dendriteCell) {
      // Add the edges to the reporting entity.
      var edge = {};
      edge.from = dendriteCell.id;
      edge.to = cell.id;
      edges.push(edge);

      totalDendrites += 1;
	  if (dendriteCell.isActive()) {
        //debug("Found active input cell!");
        sumOfInputs += 1;
      }
	  
      if ((dendriteCell.cellType == CellTypes.OPTICAL) && dendriteCell.isActive()) {console.log("Has connection with optic cell which is active.")};
      //if (dendriteCell.isActive()) console.log("And it's firing!");
    });
    //debug("Calculate sum of inputs: " + sumOfInputs);
    //if (sumOfInputs > 0) console.log("This cell received " + sumOfInputs + " inputs!");
	totalInputs += sumOfInputs;
    cell.setActive(sumOfInputs);
  });

  // Now calculate the motor cells and move the animal
  var direction = 0;
  i=0;
  sumOfInputs = 0;
  this.motorCells.forEach(function(cell){
    // Add cell to the nodes
    var cell_description = {};
    cell_description.id = cell.id;
    cell_description.label = cell.id;
    cell_description.color = "green";
    nodes.push(cell_description);

    // Check incoming connections
    cell.incomingDendrites.forEach(function(dendriteCell) {
      // Add the edges to the reporting entity.
      var edge = {};
      edge.from = dendriteCell.id;
      edge.to = cell.id;
      edges.push(edge);

	  totalDendrites += 1;
      if (dendriteCell.isActive()) {
        //debug("Found active input cell!");
        sumOfInputs += 1;
      }
    });

    //if (sumOfInputs > 0) console.log("This MOTOR cell received " + sumOfInputs + " inputs!");
	totalInputs += sumOfInputs;
    cell.setActive(sumOfInputs);
	  if (cell.isActive()) if (i%2 == 0) direction +=1; else direction-=1;
  });


  if (direction != 0) {
	   debug("Motor cells active! We're moving towards: " + direction);
	   this.position += direction;
     this.moves++;
	   if (this.position < 0) this.position = 0;
	   if (this.position > 1) this.position = 1;
  }


  // Tabulate and report the neural cell handlings...
  var activeOpticalCells = 0;
  this.opticalCells.forEach(function(cell) {
    if (cell.isActive()) activeOpticalCells += 1;
  });

  var activeNeuralCells = 0;
  this.neuralCells.forEach(function(cell) {
    if (cell.isActive()) {
      console.log("Found active neural cell! # is " + activeNeuralCells);
      activeNeuralCells += 1;
    }
  });
  this.totalNeuralMotorFirings += activeNeuralCells;

  var activeMotorCells = 0;
  this.motorCells.forEach(function(cell) {
    if (cell.isActive()) activeMotorCells += 1;
  });
  this.totalNeuralMotorFirings += activeMotorCells;


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

  var report = {};
  report.id = this.id;
  report.age = this.age;
  report.position = this.position;
  report.cellNr = this.cells.length;
  report.opticalCellNr = this.opticalCells.length;
  report.neuralCellsNr = this.neuralCells.length;
  report.motorCellsNr = this.motorCells.length;
  //console.log(activeOpticalCells + ", " + activeNeuralCells + ", " + activeMotorCells);
  report.opticalCellsActive = activeOpticalCells;
  report.neuralCellsActive = activeNeuralCells;
  report.motorCellsActive = activeMotorCells;
  report.health = this.health;
  report.moves = this.moves;
  report.totalFirings = this.totalNeuralMotorFirings;
  report.nodes = nodes;
  report.edges = edges;
  report.totalInputs = totalInputs;
  report.totalDendrites = totalDendrites;

  this.world.reportAnimal(report);

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

Animal.prototype.spawnNewAnimal = function(dna, proteins, cellType) {
  this.world.createAnimal(new Cell("newbie", this, dna, proteins, cellType), this.position);
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
