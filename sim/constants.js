/* WORLD constants */
var debug = require('debug')('constants');


var Constant = function() {
    // holder for static variables
}

// World constants
Constant.RUN_FOR_TICKS = 130;
Constant.HORIZON = 3;
Constant.DNA_MIN_SIZE = 5;
Constant.DNA_MAX_SIZE = 40;
Constant.WORLD_WIDTH = 2;
Constant.CHANCE_OF_FOOD = 0.3;
Constant.RISK_OF_DANGER = 0.1;
Constant.CHANCE_OF_RANDOM_DNA_AT_BIRTH = 0.4;
Constant.HALL_OF_FAME_SIZE = 5;

// Animal constants
Constant.HEALTH_GAIN_WHEN_FOOD = 10;
Constant.HEALTH_LOSS_WHEN_DANGER = 50;
Constant.REWARD_PER_SUCCESSFUL_MOVE = 2500;
Constant.REWARD_FOR_MOBILITY = 100;
Constant.REWARD_THRESHOLD_FOR_AGE = 80;
Constant.INITIAL_HEALTH = 350;
Constant.HEALTH_REDUCTION_ON_CELL_BRITH = 1;

Constant.CHANCE_OF_MUTATION = 0.8;
Constant.RATE_OF_MUTATION_PER_GENE = 0.05;
Constant.SIZE_OF_MUTATION = 0.25;

//Cell constants
Constant.AGE_WHEN_CELL_CAN_DIE = 5000;
Constant.RISK_OF_CELL_DEATH_OF_OLD_AGE = 0.02
Constant.NEURON_FIRING_THRESHOLD = 0;

// Protein range constants
Constant.PROTEIN_START = 0;                             // 0
Constant.REDUCTION_LENGTH = 10;                         // 0
Constant.DIVISION_LENGTH = 20;                          // 10
Constant.BLOCK_DIVISION_LENGTH = 10;                    // 30
Constant.NEURON_LENGTH = 10;                            // 40
Constant.CONNECT_DENDRITES_LENGTH = 5;                  // 50
Constant.DISCONNECT_DENDRITES_LENGTH = 5;               // 55
Constant.BLOCK_CONNECT_DENDRITES_LENGTH = 5;            // 60
Constant.BLOCK_DISCONNECT_DENDRITES_LENGTH = 5;         // 65
Constant.CONNECT_AXON_LENGTH = 10;                      // 70
Constant.BLOCK_CONNECT_AXON_LENGTH = 5;                 // 80
Constant.ACCEPT_DENDRITES_LENGTH = 5;                   // 85
Constant.BLOCK_ACCEPT_DENDRITES_LENGTH = 5;             // 90
Constant.MOTOR_CELL_LENGTH = 10;                        // 95
Constant.OPTICAL_CELL_LENGTH = 10;                      // 105
Constant.SPAWN_ANIMAL_LENGTH = 10;                      // 115
Constant.DO_NOTHING_LENGTH = 10;                        // 125
Constant.KILL_SELF_LENGTH = 1;                          // 135
Constant.NO_PROTEIN_LENGTH = 10;                        // 136

// Protein concentration multiplier constants
Constant.REDUCTION_MULTIPLIER = 10;
Constant.START_CELL_DIVISION_MULTIPLIER = 1;
Constant.BLOCK_CELL_DIVISION_MULTIPLIER = 5;
Constant.NEURON_MULTIPLIER = 10;
Constant.CONNECT_DENDRITES_MULTIPLIER = 1;
Constant.DISCONNECT_DENDRITES_MULTIPLIER = 10;
Constant.BLOCK_CONNECT_DENDRITES_MULTIPLIER = 10;
Constant.CONNECT_AXON_MULTIPLER = 10;
Constant.BLOCK_CONNECT_AXON_MULTIPLIER = 10;
Constant.ACCEPT_DENDRITES_MULTIPLIER = 1;
Constant.BLOCK_ACCEPT_DENDRITES_MULTIPLIER = 10;
Constant.DEVELOP_MOTOR_CELL_MULTIPLIER = 10;
Constant.DEVELOP_OPTICAL_CELL_MULTIPLIER = 10;
Constant.SPAWN_ANIMAL_MULTIPLIER = 2;
Constant.DO_NOTHING_MULITIPLIER = 1;
Constant.KILL_SELF_MULTIPLIER = 1;

Constant.USE_SPECIAL_DNA = false;
Constant.specialDna = [40, 13, 19, 135, 105,
                       23, 23, 24, 26, 135,
                       95, 27, 27, 135, 125,
                       125, 125, 50, 125, 125,
                       85];
// Random DNA that worked 100,115,4,110,18,13,103,33,106,46,3,18,48,145,105,44,28,34,12,129,15,102,37,45,9,85,3,52,84,78,117,26,82,37,86,5,41,51,87
//Constant.specialDna = [80, 89, 66, 32, 51, 33, 67, 8, 34, 67, 66, 25, 111, 85, 86, 13, 90];
/*Constant.specialDna = [57, 27, 68, 104, 76, 57, 44, 36, 100, 1, 60, 88, 30, 88,
   63, 25, 43, 11, 39, 78, 15, 41, 89, 9, 77, 57, 41, 32, 16, 76, 21, 94, 90,
   90, 26, 41, 93, 16, 61, 57, 91, 91, 61, 3, 56, 102, 41, 32, 4, 19, 103, 71,
   105, 63, 33, 80, 3, 66, 35, 33, 73, 22, 56, 45, 46, 37, 69, 52, 84, 85, 49,
   80, 32, 50, 91, 63, 75, 92, 34, 43, 92, 42, 60, 70, 103];*/

module.exports = Constant;
