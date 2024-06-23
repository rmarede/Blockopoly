/* eslint-disable @typescript-eslint/no-explicit-any */
import {decodeFunctionData} from "../utils/operation-encoder"
import rentalFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RentalAgreementFactory.sol/RentalAgreementFactory.json"
import rentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json"
import saleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json"
import IMultisignableAbi from "../../../besu/src/artifacts/contracts/interface/governance/IMultisignable.sol/IMultisignable.json"
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { ethers } from "ethers"

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

export interface Documentation {
    name: string,
    address: string,
    expirationDate: bigint
}

export function createDocumentation(docName: string, address: string, expirationDate: bigint): Documentation {
    const doc: Documentation = {
        name: docName,
        address: address,
        expirationDate: expirationDate
    }
    return doc;
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

export async function createOperationRequest(requestDetails: any[], id: number): Promise<OperationRequest> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const multisignableContract = new ethers.Contract(requestDetails[0], IMultisignableAbi.abi, provider);
    const contractName = await multisignableContract.getMultisignableName();
    let abi:ethers.InterfaceAbi = rentalFactoryAbi.abi;
    switch (contractName) {
        case "RentalAgreementFactory":
            abi = rentalFactoryAbi.abi;
            break;
        case "RentalAgreement":
            abi = rentalAgreementAbi.abi;
            break;
        case "SaleAgreement":
            abi = saleAgreementAbi.abi;
            break;
        case "Ownership":
            abi = OwnershipAbi.abi;
            break;
        default:
            break;
    }
    const [name, args] = decodeFunctionData(requestDetails[1], abi); 
    const request: OperationRequest = {
        id: id,
        target: requestDetails[0],
        name: name,
        args: args,
        executed: requestDetails[2]
    }
    return request;
}