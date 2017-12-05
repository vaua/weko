var debug = require('debug')('protein');

// Proteins definitions
var REDUCTION_START = 0;
var REDUCTION_LENGTH = 1;
var DIVISION_START = REDUCTION_START + REDUCTION_LENGTH;
var DIVISION_LENGTH = 10;
var NEURON_START = DIVISION_START + DIVISION_LENGTH;
var NEURON_LENGTH = 10;
var CONNECT_DENDRITES_START = NEURON_START + NEURON_LENGTH;
var CONNECT_DENDRITES_LENGTH = 5;
var DISCONNECT_DENDRITES_START = CONNECT_DENDRITES_START + CONNECT_DENDRITES_LENGTH;
var DISCONNECT_DENDRITES_LENGTH = 5;
var BLOCK_CONNECT_DENDRITES_START = DISCONNECT_DENDRITES_START + DISCONNECT_DENDRITES_LENGTH;
var BLOCK_CONNECT_DENDRITES_LENGTH = 5;
var BLOCK_DISCONNECT_DENDRITES_START = BLOCK_CONNECT_DENDRITES_START + BLOCK_CONNECT_DENDRITES_LENGTH;
var BLOCK_DISCONNECT_DENDRITES_LENGTH = 5;
var CONNECT_AXON_START = BLOCK_DISCONNECT_DENDRITES_START + BLOCK_DISCONNECT_DENDRITES_LENGTH;
var CONNECT_AXON_LENGTH = 10;
var BLOCK_CONNECT_AXON_START = CONNECT_AXON_START + CONNECT_AXON_LENGTH;
var BLOCK_CONNECT_AXON_LENGTH = 5;
var ACCEPT_DENDRITES_START = BLOCK_CONNECT_AXON_START + BLOCK_CONNECT_AXON_LENGTH;
var ACCEPT_DENDRITES_LENGTH = 5;
var BLOCK_ACCEPT_DENDRITES_START = ACCEPT_DENDRITES_START + ACCEPT_DENDRITES_LENGTH;
var BLOCK_ACCEPT_DENDRITES_LENGTH = 5;
var MOTOR_CELL_START = BLOCK_ACCEPT_DENDRITES_START + BLOCK_ACCEPT_DENDRITES_LENGTH;
var MOTOR_CELL_LENGTH = 10;
var OPTICAL_CELL_START = MOTOR_CELL_START + MOTOR_CELL_LENGTH;
var OPTICAL_CELL_LENGTH = 10;
var SPAWN_ANIMAL_START = OPTICAL_CELL_START + OPTICAL_CELL_LENGTH;
var SPAWN_ANIMAL_LENGTH = 10;
var NO_PROTEIN_START = SPAWN_ANIMAL_START + SPAWN_ANIMAL_LENGTH;
var NO_PROTEIN_LENGTH = 10;

ALL_PROTEINS_LENGTH = NO_PROTEIN_START + NO_PROTEIN_LENGTH;



var Proteins = {
  REDUCES_PROTEINS :        REDUCTION_START,                 // 0, Reduces the number of all proteins to half (but does not affect permanen proteins)
  START_CELL_DIVISION :     DIVISION_START,                  // 1, If this protein is expressed, the cell will devide itself
  NEURON :                  NEURON_START,                    // 11, Cell will get an axon that will connect to all at that time receptive axons. Permanent, makes cell neural cell.
  CONNECT_DENDRITES:        CONNECT_DENDRITES_START,         // 21, Neural cell will connect its axon to currently receptive dendrites
  DISCONNECT_DENDRITES:     DISCONNECT_DENDRITES_START,      // 26, Neural cell will disconnect X least used dendrites.
  BLOCK_CONNECT_DENDRITES:  BLOCK_CONNECT_DENDRITES_START,   // Blockerar protein that connects dendrites.
  CONNECT_AXON:             CONNECT_AXON_START,              // Neural cell connects to all receptive axons
  BLOCK_CONNECT_AXON:       BLOCK_CONNECT_AXON_START,        // Block cell from connecting to axons
  ACCEPT_DENDRITES:         ACCEPT_DENDRITES_START,          // Neural cell accepts dendrites
  BLOCK_ACCEPT_DENDRITES:   BLOCK_ACCEPT_DENDRITES_START,    // Blocks acceptance for dendrites
  DEVELOP_MOTOR_CELL:       MOTOR_CELL_START,                // Upon new cell division, this cell becomes motor cell
  DEVELOP_OPTICAL_CELL:     OPTICAL_CELL_START,              // Upon cell division, the daughter cell becomes optical cell.
  SPAWN_ANIMAL:             SPAWN_ANIMAL_START
}

var Protein = function() {

}

Protein.defs = Proteins;

/* This function takes in a gene, and returns the proteins added by the gene */
Protein.expressGene = function(geneExpressed) {
  var proteinChange = {};
  proteinChange[Proteins.REDUCES_PROTEINS] = 0;
  proteinChange[Proteins.NEURON] = 0;
  proteinChange[Proteins.SPAWN_ANIMAL] = 0;

  // Nested if-statements checking which protein has been expressed.
  if (geneExpressed < DIVISION_START) { // REDUCTION is expressed.
    proteinChange[Proteins.REDUCES_PROTEINS] += 10;
  } else if (geneExpressed < NEURON_START) {
    proteinChange[Proteins.START_CELL_DIVISION] = ((geneExpressed - DIVISION_START) + 1) * 2;
    debug('division.');
  } else if (geneExpressed < CONNECT_DENDRITES_START) {
    proteinChange[Proteins.NEURON] += 10;
    debug("Neuron, proteint change is " + proteinChange[Proteins.NEURON]);
  } else if (geneExpressed < DISCONNECT_DENDRITES_START) {
    proteinChange[Proteins.CONNECT_DENDRITES] = ((geneExpressed - CONNECT_DENDRITES_START) + 1) * 10;
    debug("Connect dendrites");
  } else if (geneExpressed < BLOCK_CONNECT_DENDRITES_START) {
    proteinChange[Proteins.DISCONNECT_DENDRITES] = ((geneExpressed - DISCONNECT_DENDRITES_START) + 1) * 10;
    debug("Disconnect dendrites");
  } else if (geneExpressed < CONNECT_AXON_START) {
    proteinChange[Proteins.BLOCK_CONNECT_DENDRITES] = ((geneExpressed - BLOCK_CONNECT_DENDRITES_START) + 1) * 10;
    debug("Block conect dendrites");
  } else if (geneExpressed < BLOCK_CONNECT_AXON_START) {
    proteinChange[Proteins.CONNECT_AXON] = ((geneExpressed - CONNECT_AXON_START) + 1) * 10;
    debug("Axon start");
  } else if (geneExpressed < ACCEPT_DENDRITES_START) {
    proteinChange[Proteins.BLOCK_CONNECT_AXON] = ((geneExpressed - BLOCK_CONNECT_AXON_START) + 1) * 10;
    debug("Block connect axon");
  } else if (geneExpressed < BLOCK_ACCEPT_DENDRITES_START) {
    proteinChange[Proteins.ACCEPT_DENDRITES] = ((geneExpressed - ACCEPT_DENDRITES_START) + 1) * 10;
    debug("Accept dendrites start");
  } else if (geneExpressed < MOTOR_CELL_START) {
    proteinChange[Proteins.BLOCK_ACCEPT_DENDRITES] = ((geneExpressed - BLOCK_ACCEPT_DENDRITES_START) + 1) * 10 ;
    debug("Block accept dendrites");
  } else if (geneExpressed < OPTICAL_CELL_START) {
    proteinChange[Proteins.DEVELOP_MOTOR_CELL] = ((geneExpressed - MOTOR_CELL_START) + 1) * 10;
    debug("Motor cell");
  } else if (geneExpressed < SPAWN_ANIMAL_START) {
    proteinChange[Proteins.DEVELOP_OPTICAL_CELL] = ((geneExpressed - OPTICAL_CELL_START) + 1) * 10;
    debug("Optical cell");
  } else if (geneExpressed < NO_PROTEIN_START) {
    proteinChange[Proteins.SPAWN_ANIMAL] += 2;
    debug("Spawning new animal.");
  }

  return proteinChange;
}

module.exports = Protein;
