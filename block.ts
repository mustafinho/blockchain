export class BlockHeader {
    version
    previousBlockHeader
    merkleRoot
    time
    constructor(version, previousBlockHeader, merkleRoot, time) {
        this.version = version;
        this.previousBlockHeader = previousBlockHeader;
        this.merkleRoot = merkleRoot;
        this.time = time;
    }
};

export class Block {
    blockHeader
    index
    txns
    constructor(blookHeader, index, txns) {
        this.blockHeader = blookHeader;
        this.index = index;
        this.txns = txns;
    }

 
}