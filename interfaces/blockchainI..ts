interface IBlockChain {
    blocks: Array<IBlock>,
    addBlock(block: IBlock): void,
    validateChain(): boolean
}