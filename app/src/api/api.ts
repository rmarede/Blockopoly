export interface Realty {
    name: string,
    ownership: string,
    kind: string,
    district: string,
    location: string,
    image: string,
    totalArea: string
}

export interface Sale {
    address: string;
    buyer: string;
    seller: string;
    realty: string;
    share: number;
    price: number;
    earnest: number;
    realtor: string;
    comission: number;
    contengencyPeriod: number;
    contengencyClauses: string;
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