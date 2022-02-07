import { BlockHeader, Block } from './block'
// import {sha2} from 'crypto'
import moment from "moment"

const getGenesisBlock = () => {
    let blockHeader = new BlockHeader(
        1,
        null,
        "0x1bc3300000000000000000000000000000000000000000000",
        new Date().getTime());

    return new Block(blockHeader, 0, null);
}
//creation of gnesis block
export const blockchain = [getGenesisBlock()]
export const getLatestBlock = () => blockchain[blockchain.length - 1]


//send blocks
export const addBlock = (newBlock: Block) => {
    const prevBlock: Block = getLatestBlock();

    if (prevBlock.index < newBlock.index && 
        newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        blockchain.push(newBlock)
    }

}

//request blocks
export const getBlock = (index: number) => {
    if (blockchain.length - 1 >= index) return blockchain[index]
    else return null
}




// export const storeBlock = (newBlock) =>{

// }

// export const generateNextBlock = (txns)  =>{
//     const prevBlock = getLatestBlock(), prevMerkleRoot = prevBlock.blockHeader.merkleRoot;

//     const nextIndex = prevBlock.index + 1;

//     const nexTime = new Date().getTime();

//     const nextMerkleRoot = SHA256(1, prevMerkleRoot, nexTime).toString()

//     const blockHeader = new BlockHeader(1, prevMerkleRoot, nextMerkleRoot, nexTime)
//     const newBlock = new Block(blockHeader, nextIndex, txns);
//     blockchain.push(newBlock);
//     storeBlock(newBlock);
//     return newBlock
// }