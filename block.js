"use strict";
exports.__esModule = true;
exports.Block = exports.BlockHeader = void 0;
var BlockHeader = /** @class */ (function () {
    function BlockHeader(version, previousBlockHeader, merkleRoot, time) {
        this.version = version;
        this.previousBlockHeader = previousBlockHeader;
        this.merkleRoot = merkleRoot;
        this.time = time;
    }
    return BlockHeader;
}());
exports.BlockHeader = BlockHeader;
;
var Block = /** @class */ (function () {
    function Block(blookHeader, index, txns) {
        this.blockHeader = blookHeader;
        this.index = index;
        this.txns = txns;
    }
    return Block;
}());
exports.Block = Block;
