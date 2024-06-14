export interface Realty {
    name: string,
    ownership: string,
    kind: string,
    district: string,
    location: string,
    image: string,
    totalArea: bigint
}

export function createRealty(realtyDetails: any[]): Realty {
    const realty: Realty = {
        name: realtyDetails[0],
        ownership: realtyDetails[1],
        kind: realtyDetails[2],
        district: realtyDetails[3],
        location: realtyDetails[4],
        image: realtyDetails[5],
        totalArea: realtyDetails[6]
    }
    return realty;
}

export interface Sale {
    address: string;
    status: number;
    buyer: string;
    seller: string;
    realty: string;
    share: bigint;
    price: bigint;
    earnest: bigint;
    realtor: string;
    comission: bigint;
    contengencyPeriod: bigint;
    contengencyClauses: string;
}

export function createSale(saleDetails: any[], address: string, status: number): Sale {
    const sale: Sale = {
        address: address,
        status: status,
        buyer: saleDetails[0],
        seller: saleDetails[1],
        realty: saleDetails[2],
        share: saleDetails[3],
        price: saleDetails[4],
        earnest: saleDetails[5],
        realtor: saleDetails[6],
        comission: saleDetails[7],
        contengencyPeriod: saleDetails[8],
        contengencyClauses: saleDetails[9]
    }
    return sale;
}

export interface Rental {
    address: string;
    tenant: string;
    landlord: string;
    realty: string;
    startDate: number;
    duration: number;
    rentValue: number;
    securityDeposit: number;
    securityReturnDueDate: number;
    paymentDueDate: number;
    latePaymentFee: number;
    earlyTerminationFee: number;
    earlyTerminationNotice: number;
    extra: string;
    payees: string[];
    shares: number[];
}

export function createRental(rentalDetails: any[], address: string): Rental {
    const rental: Rental = {
        address: address,
        tenant: rentalDetails[0],
        landlord: rentalDetails[1],
        realty: rentalDetails[2],
        startDate: rentalDetails[3],
        duration: rentalDetails[4],
        rentValue: rentalDetails[5],
        securityDeposit: rentalDetails[6],
        securityReturnDueDate: rentalDetails[7],
        paymentDueDate: rentalDetails[8],
        latePaymentFee: rentalDetails[9],
        earlyTerminationFee: rentalDetails[10],
        earlyTerminationNotice: rentalDetails[11],
        extra: rentalDetails[12],
        payees: rentalDetails[13],
        shares: rentalDetails[14]
    }
    return rental;
}

export interface Loan {
    address: string;
    lender: string;
    borrower: string;
    principal: number;
    downPayment: number;
    interestRate: number;
    loanTerm: number;
    startDate: number;
    gracePeriod: number;
    latePaymentFee: number;
    defaultDeadline: number;
}

export function createLoan(loanDetails: any[], address: string): Loan {
    const loan: Loan = {
        address: address,
        lender: loanDetails[0],
        borrower: loanDetails[1],
        principal: loanDetails[2],
        downPayment: loanDetails[3],
        interestRate: loanDetails[4],
        loanTerm: loanDetails[5],
        startDate: loanDetails[6],
        gracePeriod: loanDetails[7],
        latePaymentFee: loanDetails[8],
        defaultDeadline: loanDetails[9]
    }
    return loan;
}