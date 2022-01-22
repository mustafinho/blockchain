interface IBlockHeader {
    previousBlockHeader:IBlockHeader
    merkleRoot: string,
    creationTime: number
}

