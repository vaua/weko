/* WORLD constants */
var debug = require('debug')('constants');


var Constant = function () {
  // holder for static variables
}

// World constants
Constant.RUN_FOR_TICKS = 130;
Constant.HORIZON = 3;
Constant.DNA_MIN_SIZE = 10;
Constant.DNA_MAX_SIZE = 400;
Constant.WORLD_WIDTH = 2;
Constant.CHANCE_OF_FOOD = 0.3;
Constant.RISK_OF_DANGER = 0.3;

// Animal constants
Constant.HEALTH_GAIN_WHEN_FOOD = 5;
Constant.HEALTH_LOSS_WHEN_DANGER = 7;

//Cell constants
Constant.AGE_WHEN_CELL_CAN_DIE = 100;
Constant.RISK_OF_CELL_DEATH_OF_OLD_AGE = 0.02
Constant.NEURON_FIRING_THRESHOLD = 5;

// Protein range constants
Constant.PROTEIN_START = 0;
Constant.REDUCTION_LENGTH = 1;
Constant.DIVISION_LENGTH = 10;
Constant.NEURON_LENGTH = 10;
Constant.CONNECT_DENDRITES_LENGTH = 5;
Constant.DISCONNECT_DENDRITES_LENGTH = 5;
Constant.BLOCK_CONNECT_DENDRITES_LENGTH = 5;
Constant.BLOCK_DISCONNECT_DENDRITES_LENGTH = 5;
Constant.CONNECT_AXON_LENGTH = 10;
Constant.BLOCK_CONNECT_AXON_LENGTH = 5;
Constant.ACCEPT_DENDRITES_LENGTH = 5;
Constant.BLOCK_ACCEPT_DENDRITES_LENGTH = 5;
Constant.MOTOR_CELL_LENGTH = 10;
Constant.OPTICAL_CELL_LENGTH = 10;
Constant.SPAWN_ANIMAL_LENGTH = 10;
Constant.NO_PROTEIN_LENGTH = 10;

// Protein concentration multiplier constants
Constant.REDUCTION_MULTIPLIER = 10;
Constant.START_CELL_DIVISION_MULTIPLIER = 2;
Constant.NEURON_MULTIPLIER = 10;
Constant.CONNECT_DENDRITES_MULTIPLIER = 10;
Constant.DISCONNECT_DENDRITES_MULTIPLIER = 10;
Constant.BLOCK_CONNECT_DENDRITES_MULTIPLIER = 10;
Constant.CONNECT_AXON_MULTIPLER = 10;
Constant.BLOCK_CONNECT_AXON_MULTIPLIER = 10;
Constant.ACCEPT_DENDRITES_MULTIPLIER = 10;
Constant.BLOCK_ACCEPT_DENDRITES_MULTIPLIER = 10;
Constant.DEVELOP_MOTOR_CELL_MULTIPLIER = 10;
Constant.DEVELOP_OPTICAL_CELL_MULTIPLIER = 10;
Constant.SPAWN_ANIMAL_MULTIPLIER = 2;

module.exports = Constant;
