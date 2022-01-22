interface ITransaction {
    claimNumber: string,
    settlementAmount: number,
    settlementDate: Date,
    carRegistration: string,
    mileage: number,
    claimType:string
    calculateTransactionHash(): string
}