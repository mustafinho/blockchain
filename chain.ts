import { BlockHeader, Block } from './block'

const getGenesisBlock = () => {
    let blockHeader = new BlockHeader(
        1,
        null,
        "0x1bc3300000000000000000000000000000000000000000000",
        new Date().getTime());

    return new Block(blockHeader, 0, null);
}

export const blockchain = [getGenesisBlock()]
export const getLatestBlock = () => blockchain[blockchain.length - 1]

export const addBlock = (newBlock) => {
    const prevBlock = getLatestBlock();

    if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        blockchain.push(newBlock)
    }

}

export const getBlock = (index) => {
    if (blockchain.length - 1 >= index) return blockchain[index]
    else return null
}
