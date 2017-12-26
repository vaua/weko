var Cell = require("./cell.js");
var debug = require('debug')('animal');
var Constant = require('./constants.js');

function Animal(dna, id, position, world, initialCell, ancestor) {
  this.dna = dna;
  this.id = id;
  this.age = 0;
  this.world = world;
  this.cells = [];
  this.newCells = [];
  this.deadCells = [];
  this.cellsWithWillingDendrites = new Set();
  this.cellsAcceptingDendrites = new Set();
  this.neuralCells = [];
  this.opticalCells = [];
  this.motorCells = [];
  this.position = position;
  this.totalNeuralMotorFirings = 0;
  this.moves = 0;
  this.left = 0;
  this.right = 0;
  this.realMoves = 0;
  this.successfulMoves = 0;
  this.ancestor = ancestor;
  this.foodEatenLeft = 0;
  this.dangerFacedLeft = 0;
  this.foodEatenRight = 0;
  this.dangerFacedRight = 0;
  this.motorCellNumber = 0;
  // Initiate the original cell to the original values
  this.health = Constant.INITIAL_HEALTH;
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

  this.proteins = null;

  this.cells.forEach(function(cell) {
    //debug("Ticking a cell with id: " + cell.id + ".");
	  if (cell === undefined) console.log("The cell is undefined.");
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

    // Some house keeping, report some stats to the world.
    this.world.left += this.left;
    this.world.right += this.right;
    // But before, calculate fitness point and see if it was good!
    var fitness = (this.successfulMoves * Constant.REWARD_PER_SUCCESSFUL_MOVE) +
                  ((this.moves > 0) * Constant.REWARD_FOR_MOBILITY) +
                  ((this.totalNeuralMotorFirings > 0) * this.totalNeuralMotorFirings) +
                  ((this.age > Constant.REWARD_THRESHOLD_FOR_AGE) * (this.age - Constant.REWARD_THRESHOLD_FOR_AGE));
    if (fitness > 0) {
      if ((this.world.dnaHallOfFame.dna === undefined) || (fitness > this.world.dnaHallOfFame.fitness)) {
        this.world.dnaHallOfFame.dna = this.dna;
        this.world.dnaHallOfFame.fitness = fitness;
        this.world.dnaHallOfFame.age = this.age;
        this.world.dnaHallOfFame.id = this.id;
        console.log("Switching dna leader to this awesome animal " + this.id + " that got " + fitness + " points by having " + this.successfulMoves + " successful moves, " +
          this.totalNeuralMotorFirings + " neural firings and respectable age of " + this.age + " at death.");
        //let i; // inportant to be outside
        //for(i = 0; i < this.dna.length - 1; i++) console.log(this.dna[i] + ",");
      }
    }

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
    debug("Added " + that.cellsWithWillingDendrites.length + " to cell with id " + cell.id);
  });
  // Now wipe these two lists as we have added all needed connections
  this.cellsAcceptingDendrites.clear();
  this.cellsWithWillingDendrites.clear();

  // Now, all cells have ticked. Let's run the neural network.
  // Get inputs from the world and set optical cells.
  // Position: 0: food left, 1: danger left, 2: food right, 3: danger right.
  // Inputs get these values in order.
  var nodes = [];
  var edges = [];
  var visualInput = this.world.getVisualInput();
  debug("Obtained visual input: " + visualInput);

  var opticalCellNumber = 0;
  this.opticalCells.forEach(function(cell) {
    // Add cell to the nodes
    var cell_description = {};
    cell_description.id = cell.id;
    cell_description.label = cell.id;
    cell_description.color = "yellow";
    nodes.push(cell_description);
    // There are four options in the world - every forth optical cell react to specific thing.
    var rest = opticalCellNumber % 4;
    if (rest == 0) if (visualInput[0]%2 == 1) cell.setActive(199);  // Food left in field - this cell should be active.
    if (rest == 1) if (visualInput[0] > 1) cell.setActive(199);  // Danger left in field - thiss cell
    if (rest == 2) if (visualInput[1]%2 == 1) cell.setActive(199);  // Food right in field - this cell should be active.
    if (rest == 3) if (visualInput[1] > 1) cell.setActive(199);  // Danger right in field - thiss cell
    opticalCellNumber++;
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
      edge.arrows = "to";
      edge.color = "black";
      edges.push(edge);

      totalDendrites += 1;
	    if (dendriteCell.isActive()) sumOfInputs += 1;

      if ((dendriteCell.cellType == CellTypes.OPTICAL) && dendriteCell.isActive()) debug("Has connection with optic cell which is active.");
    });

	totalInputs += sumOfInputs;
    cell.setActive(sumOfInputs);
  });

	/* Now calculate the motor cells and move the animal */
	var direction = 0;

	this.motorCells.forEach(function(cell){
		// Add cell to the nodes
		var cell_description = {};
		cell_description.id = cell.id;
		cell_description.label = cell.id;
		cell_description.color = "green";
		nodes.push(cell_description);

		// Check incoming connections
		var sumOfInputs = 0; // sum of input to one cell from all its dendrites. Set to 0 before summing inputs.
		cell.incomingDendrites.forEach(function(dendriteCell) {
			// Add the edges to the reporting entity.
			var edge = {};
			edge.from = dendriteCell.id;
			edge.to = cell.id;
			edge.arrows = "to";
			edge.color = "red";
			edges.push(edge);

			totalDendrites += 1;
			if (dendriteCell.isActive()) {
				//debug("Found active input cell!");
				sumOfInputs += 1;
			}
		});

		totalInputs += sumOfInputs;
		cell.setActive(sumOfInputs);

		// Now, check if the cell is active and contribute to the move.
		if (cell.isActive()) {
			//console.log("Motor cell with number " + motorCellNumber + " is active!");
			if (that.motorCellNumber % 2 == 0) {
				direction += 1;
			}
			else {
				direction -= 1;
			}
		}

		that.motorCellNumber++; // Next cell, next directions.
	});

	/* Move the animal */
  //console.log("Direction: " + direction);
	if ((direction * direction) > 1) {
		//debug("Motor cells active! We're moving towards: " + direction);
		var oldPosition = this.position;
		this.position += direction;
		this.moves++;

		if (direction > 0) this.right++;
		else this.left++;
		//console.log("Left/Right: " + this.left + "/" + this.right);
		// Now that we are moving, check if the move is successful. Are we moving away from danger? Or to food?
		if (this.position < 0) this.position = 0;
		if (this.position > 1) this.position = 1;

		if (this.position != oldPosition) { // We have actually moved...
			this.realMoves++;
			//console.log("Moved, direction is " + direction + " and visual " + visualInput);
			if ((visualInput[0] % 2 == 1) && direction < 0) {
				this.successfulMoves++;   // Food left in field - this cell should be active.
				debug("Successful!");
			}
			else if ((visualInput[0] > 1) && direction > 0) {
				this.successfulMoves++;  // Danger left in field - thiss cell
				debug("Successful!");
			}
			else if ((visualInput[1] % 2 == 1) && direction > 0) {
				this.successfulMoves++;  // Food right in field - this cell should be active.
				debug("Successful!");
			}
			else if ((visualInput[1] > 1) && direction < 0) {
				this.successfulMoves++;  // Danger right in field - thiss cell
				debug("Successful!");
			} else {
        debug("Wrong move.");
      }
		} else {
			//console.log("Attempted to move in a wrong direction. Was in position " + this.position + ", wanted to move " + direction + "!");
		}
	}


  // Tabulate and report the neural cell handlings...
  var activeOpticalCells = 0;
  this.opticalCells.forEach(function(cell) {
    if (cell.isActive()) activeOpticalCells += 1;
  });

  var activeNeuralCells = 0;
  this.neuralCells.forEach(function(cell) {
    if (cell.isActive()) activeNeuralCells += 1;
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
    if (visualInput[0] % 2 == 1) {
		this.health += Constant.HEALTH_GAIN_WHEN_FOOD; // Food was in the left area.
		this.foodEatenLeft++;
	}
    if (visualInput[0] > 1) {
		this.health -= Constant.HEALTH_LOSS_WHEN_DANGER; // Danger was in the left area.
		this.dangerFacedLeft++;
	}
  } else if (this.position == 1 ) {
    if (visualInput[1] % 2 == 1) {
		this.health += Constant.HEALTH_GAIN_WHEN_FOOD; // Food was in the right area.
		this.foodEatenRight++;
	}
    if (visualInput[1] > 1) {
		this.health -= Constant.HEALTH_LOSS_WHEN_DANGER; // Danger was in the right area.
		this.dangerFacedRight++;
	}
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
  report.left = this.left;
  report.right = this.right;
  report.realMoves = this.realMoves;
  report.successfulMoves = this.successfulMoves;
  report.totalFirings = this.totalNeuralMotorFirings;
  report.nodes = nodes;
  report.edges = edges;

  report.totalInputs = totalInputs;
  report.totalDendrites = totalDendrites;
  report.ancestor = this.ancestor;
  report.foodEatenLeft = this.foodEatenLeft;
  report.foodEatenRight = this.foodEatenRight;
  report.dangerFacedLeft = this.dangerFacedLeft;
  report.dangerFacedRight = this.dangerFacedRight;

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
  this.cellsWithWillingDendrites.add(cell);
}

Animal.prototype.addCellAcceptingDendrites = function(cell) {
  this.cellsAcceptingDendrites.add(cell);
}

module.exports = Animal;
