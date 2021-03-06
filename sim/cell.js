var Protein = require("./protein.js");
var Constant = require('./constants.js');
var debug = require('debug')('cell');


CellTypes = {
    NONE: 0,
    NEURON: 1,
    MOTOR: 2,
    OPTICAL: 3
}

function Cell(id, parent, dna, proteins, cellType, positionInDna) {
    this.cellAge = 0;
    this.id = id;
    this.dna = dna;
    this.markedForDeath = false;
    this.proteins = proteins; // this is the protein map - needs to be halved for the more realistic scenario.
    this.parentAnimal = parent;
    this.positionInDna = positionInDna;
    this.cellType = cellType;
    this.active = false;
    this.incomingDendrites = new Set();
    debug("New cell is born with name: " + this.id + " and cell type " + this.cellType);

    // Handle neural cells
    if (this.cellType > 0) { // TODO: Fix this ugly shortcut comparison to proper cell type check
        debug("We got ourselves a cool neural extended cell!");
        if (this.cellType === CellTypes.NEURON) {
            this.parentAnimal.addNeuralCell(this);
        }

        if (this.cellType === CellTypes.MOTOR) {
            this.parentAnimal.addMotorCell(this);
        }

        if (this.cellType === CellTypes.OPTICAL) {
            this.parentAnimal.addOpticalCell(this);
        }
    }
    //debug("DNA is: " + this.dna);
}

/**
 * Checks whether a protein is contained in the cell at the given time.
 */
Cell.prototype.hasProtein = function(protein) {
    debug("Cell " + this.id + " Checking if protein " + protein + " exists in the cell.");

    if (this.proteins.hasOwnProperty(protein)) {
        debug("Cell " + this.id + " Protein is in the cell with concentration " + this.proteins[protein]);
        return this.proteins[protein] >= 1;
    } else return false;
}

Cell.prototype.addIncomingDendrites = function(dendrites) {
    var that = this;
    dendrites.forEach(function(dendrite) {
        debug("Adding dendrite " + dendrite.id + " to cell " + that.id);
        that.incomingDendrites.add(dendrite);
    });
}

Cell.prototype.isActive = function() {
    return this.active;
}

Cell.prototype.setActive = function(activeInputs) {
    if (activeInputs > Constant.NEURON_FIRING_THRESHOLD) {
        this.active = true;
        //if (activeInputs != 199) console.log("Cell is firing.");
    } else {
        this.active = false;
    }
}

/**
 * Main function executed for the cell on every tick.
 */
Cell.prototype.tick = function() {
    var that = this;
    this.cellAge += 1;
    this.active = false;
    debug("Cell " + this.id + " is entering its " + this.cellAge + " tick.");

    // check cell age and kill cell if it dies.
    if (this.cellAge > Constant.AGE_WHEN_CELL_CAN_DIE) {
        // cell can die - some risk is applied
        if (Math.random() < Constant.RISK_OF_CELL_DEATH_OF_OLD_AGE) {
            //cell dies
            this.parentAnimal.addForRemoval(this);
            console.log("Old age death!");
        }
    }

    // Do what the DNA and outer and inner level tell you to do.
    //action = dna[innerLevel];
    debug("Cell " + this.id + " Protein keys in the beginning of turn: " + Object.keys(this.proteins));

    Object.keys(this.proteins).forEach(function(key) {
        debug("protein key: " + key + " value: " + that.proteins[key]);
    });

    // Expressing the DNA
    if (!(this.positionInDna < 0 || this.positionInDna > this.dna.length)) {
        debug("Cell " + this.id + " Expressing gene " + this.positionInDna + " with protein " + this.dna[this.positionInDna]);

        // Expressing the genes
        var geneExpressed = this.dna[this.positionInDna];
        var proteinChange = Protein.expressGene(geneExpressed);

        Object.keys(proteinChange).forEach(function(key) {
            debug("Cell " + that.id + " Added protein " + key + " amount of " + proteinChange[key]);
            addProteinIntoTheMix(that.proteins, key, proteinChange[key]);
            debug("Cell " + that.id + " Has " + that.proteins[key] + " of protein " + key + " after the change.");
        });
    } else {
        debug("Cell " + this.id + "The DNA position " + this.positionInDna + " is outside of the size od DNA. No protein was expressed.");
    }

    // increase positionInDna
    this.positionInDna += 1;

    if (this.hasProtein(Protein.defs.DO_NOTHING)) {
        debug("Cell " + this.id + " Doing nothing.");
    } else {

        if (this.hasProtein(Protein.defs.KILL_SELF)) {
            debug("Cell " + this.id + " Killing cell...");
            this.parentAnimal.addForRemoval(this);
        }

        if (this.hasProtein(Protein.defs.NEURON) && this.cellType == CellTypes.NONE) {
            debug("Cell " + this.id + " I am a neuron cell!");
            this.cellType = CellTypes.NEURON;
        }


        if (this.hasProtein(Protein.defs.SPAWN_ANIMAL)) {
            debug("Cell " + this.id + " Spawning! But let's wait with that for a minute...");
            /*
            debug("First, create a new cell!");
            //TODO: Reduce protein mix to half before spawing the cell.
            reduceProteinMixByHalf(this.proteins);

            // copy the proteins, TODO: reduce the number
            var newCellProtein = {};
            Object.keys(this.proteins).forEach(function(key) {
              newCellProtein[key] = that.proteins[key];
            });
            this.parentAnimal.spawnNewAnimal(this.dna, this.proteins, this.cellType);
            this.parentAnimal.health -= 10; // Reduce the health upon birth, significantly
            */
        }

        // Now, do actions for all proteins found in the cell
        if (this.hasProtein(Protein.defs.REDUCES_PROTEINS)) {
            debug("Cell " + this.id + " Reducing proteins (not yet).");
            //reduceProteinMixByHalf(this.proteins);
        }

        if (this.hasProtein(Protein.defs.START_CELL_DIVISION)) {
            if (this.hasProtein(Protein.defs.BLOCK_CELL_DIVISION)) {
                debug("Cell " + this.id + " Cell division blocked.");
            } else {
                debug("Cell " + this.id + " Creating new cell!");
    			var divNumber = this.proteins[Protein.defs.START_CELL_DIVISION];
    			var dnaPositionToStart = Math.floor((this.dna.length / Constant.DIVISION_LENGTH) * divNumber);
                // remove divNumber proteins from the division proteins
                this.proteins[Protein.defs.START_CELL_DIVISION] -= divNumber;


    			//console.log("Concentration of division is " + divNumber + ", DNA length is " + this.dna.length + " yielded start number " + dnaPositionToStart);


                //TODO: Reduce protein mix to half before spawing the cell.
                reduceProteinMixByHalf(this.proteins);

                // copy the proteins, TODO: reduce the number
                var newCellProtein = {};
                Object.keys(this.proteins).forEach(function(key) {
                    newCellProtein[key] = that.proteins[key];
                });
                this.parentAnimal.createNewCell(this.dna, newCellProtein, this.cellType, dnaPositionToStart);
                this.parentAnimal.health -= Constant.HEALTH_REDUCTION_ON_CELL_BRITH; // Reduce the health upon birth
            }
        }

        //TODO: Some of the checks in here will need to be splitted out for optical, motor cells.
        if (this.cellType > CellTypes.NONE) {
            if (this.hasProtein(Protein.defs.CONNECT_DENDRITES) && this.cellType != CellTypes.MOTOR) { // Motor cell has no dendrites - its firing affects the movement
                debug("Connecting dendrites");
                if (this.hasProtein(Protein.defs.BLOCK_CONNECT_DENDRITES)) {
                    debug("Blocking connecting dendrites.");
                } else {
                    this.parentAnimal.addCellWithWillingDendrites(this);
                }
            }

            if (this.hasProtein(Protein.defs.ACCEPT_DENDRITES) && this.cellType != CellTypes.OPTICAL) { // Optical cells need no incoming dendrites - they are driven by inputs directly
                debug("Accepting dendrites");
                if (this.hasProtein(Protein.defs.BLOCK_ACCEPT_DENDRITES)) {
                    debug("Blocking accepting dendrites.");
                } else {
                    this.parentAnimal.addCellAcceptingDendrites(this);
                }
            }

            if (this.hasProtein(Protein.defs.DISCONNECT_DENDRITES)) {
                debug("Disconnecting dendrites");
                //TODO: Implement
            }

            if (this.hasProtein(Protein.defs.CONNECT_AXON)) {
                debug("Connecting Axon!");
                //TODO: Most likely remove.
            }

            if (this.hasProtein(Protein.defs.DEVELOP_MOTOR_CELL) && (this.cellType == CellTypes.NEURON)) { // If this is plane neuron, now it will become motor cell
                debug("Cell " + this.id + " I'm a motor cell now!");
                this.cellType = CellTypes.MOTOR;
            }

            if (this.hasProtein(Protein.defs.DEVELOP_OPTICAL_CELL) && (this.cellType == CellTypes.NEURON)) { // If this is a plane neuron, now it will become optical cell
                debug("Cell " + this.id + " I'm an optical cell now!");
                this.cellType = CellTypes.OPTICAL;
            }
        }
    }

    // Once done with all actions, reduce all protein concentrations by half
    reduceProteinMixByHalf(this.proteins);

    // run the neural network, inputs, inter, outputs
}

/**
 * Adds specified amount of a specified protein into the cell protein mix.
 */
function addProteinIntoTheMix(proteins, protein, amount) {
    if (proteins.hasOwnProperty(protein)) {
        proteins[protein] += amount;
    } else proteins[protein] = amount;
}

/**
 * Reduces the protein mix by half, rounding up. Useful when splitting up the cell.
 */
function reduceProteinMixByHalf(proteins) {
    Object.keys(proteins).forEach(function(key) {
        proteins[key] = proteins[key] / 2;
        if (proteins[key] < 1) delete proteins[key];
    });
}

/**
 * Reduces protein mix by one. Useful on every tick. Should not affect the "permanent" proteins, like neuron_protein.
 */
function reduceProteinMixByOne(proteins) {
    Object.keys(proteins).forEach(function(key) {
        if (proteins[key] > 1) proteins[key] -= 1;
        if (proteins[key] < 1) delete proteins[key];
    });
}

/**
 * Returns the concentration of some protein in the cell (amount)
 */
function getProteinConcentration(protein) {
    //debug("Protein je: " + protein);
    if (protein !== undefined) return protein;
    else return 0;
}

module.exports = Cell;
