export class BlockHeader {
    version
    previousBlockHeader
    merkleRoot
    time

    constructor(version: number, previousBlockHeader: BlockHeader | null, merkleRoot, time: number) {
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
    constructor(blookHeader: BlockHeader, index: number, txns: string | null) {
        this.blockHeader = blookHeader;
        this.index = index;
        this.txns = txns;
    }

 
}