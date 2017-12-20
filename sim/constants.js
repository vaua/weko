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
Constant.NUMBER_OF_PROTEINS = ALL_PROTEINS_LENGTH;

// Animal constants
Constant.HEALTH_GAIN_WHEN_FOOD = 5;
Constant.HEALTH_LOSS_WHEN_DANGER = 7;

//Cell constants
Constant.AGE_WHEN_CELL_CAN_DIE = 100;
Constant.RISK_OF_CELL_DEATH_OF_OLD_AGE = 0.02
Constant.NEURON_FIRING_THRESHOLD = 1;


module.exports = Constant;
