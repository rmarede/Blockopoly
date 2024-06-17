/* eslint-disable @typescript-eslint/no-explicit-any */
import {decodeFunctionData} from "../utils/operation-encoder"


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
    status: number;
    address: string;
    tenant: string;
    realty: string;
    startDate: bigint;
    duration: bigint;
    rentValue: bigint;
    securityDeposit: bigint;
    securityReturnDueDate: bigint;
    paymentDueDate: bigint;
    latePaymentFee: bigint;
    earlyTerminationFee: bigint;
    earlyTerminationNotice: bigint;
    extra: string;
}

export function createRental(rentalDetails: any[], address: string, tenant: string, status: number): Rental {
    const rental: Rental = {
        status: status,
        address: address,
        tenant: tenant,
        realty: rentalDetails[0],
        startDate: rentalDetails[1],
        duration: rentalDetails[2],
        rentValue: rentalDetails[3],
        securityDeposit: rentalDetails[4],
        securityReturnDueDate: rentalDetails[5],
        paymentDueDate: rentalDetails[6],
        latePaymentFee: rentalDetails[7],
        earlyTerminationFee: rentalDetails[8],
        earlyTerminationNotice: rentalDetails[9],
        extra: rentalDetails[10],
    }
    return rental;
}

export interface Loan {
    address: string;
    lender: string;
    borrower: string;
    principal: bigint;
    downPayment: bigint;
    interestRate: bigint;
    loanTerm: bigint;
    startDate: bigint;
    gracePeriod: bigint;
    latePaymentFee: bigint;
    defaultDeadline: bigint;
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

export interface OperationRequest {
    id: number;
    target: string;
    name: string;
    args: any[];
    executed: boolean;
}

export function createOperationRequest(requestDetails: any[], id: number): OperationRequest {
    const [name, args] = decodeFunctionData(requestDetails[1]); 
    const request: OperationRequest = {
        id: id,
        target: requestDetails[0],
        name: name,
        args: args,
        executed: requestDetails[2]
    }
    return request;
}