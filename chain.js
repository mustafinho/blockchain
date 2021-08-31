"use strict";
exports.__esModule = true;
exports.getBlock = exports.addBlock = exports.getLatestBlock = exports.blockchain = void 0;
var block_1 = require("./block");
var getGenesisBlock = function () {
    var blockHeader = new block_1.BlockHeader(1, null, "0x1bc3300000000000000000000000000000000000000000000", new Date().getTime());
    return new block_1.Block(blockHeader, 0, null);
};
exports.blockchain = [getGenesisBlock()];
var getLatestBlock = function () { return exports.blockchain[exports.blockchain.length - 1]; };
exports.getLatestBlock = getLatestBlock;
var addBlock = function (newBlock) {
    var prevBlock = exports.getLatestBlock();
    if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        exports.blockchain.push(newBlock);
    }
};
exports.addBlock = addBlock;
var getBlock = function (index) {
    if (exports.blockchain.length - 1 >= index)
        return exports.blockchain[index];
    else
        return null;
};
exports.getBlock = getBlock;
