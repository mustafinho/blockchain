interface IBlock {
    blockHeader: IBlockHeader,
    readonly transactions: Array<ITransaction>,
    readonly blockNumber:number,
    readonly prevBlockHash: string,
    readonly creationDate: Date,
    readonly difficulty: number,
    readonly nounce: number,
    calculateBlockHash():string,
}



