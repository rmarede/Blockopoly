/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";
import rentalFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RentalAgreementFactory.sol/RentalAgreementFactory.json"
import rentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json"

export function encodeRentalFactoryData(functionToCall: string, params: any[]) {
    const itf = new ethers.Interface(rentalFactoryAbi.abi);
    const data = itf.encodeFunctionData(functionToCall, params);
    return data;
}

export function encodeRentalAgreementData(functionToCall: string, params: any[]) {
    const itf = new ethers.Interface(rentalAgreementAbi.abi);
    const data = itf.encodeFunctionData(functionToCall, params);
    return data;
}

export function decodeFunctionData(data:string, abi:ethers.InterfaceAbi) : [string, any[]] {
    const itf = new ethers.Interface(abi);
    const decoded = itf.parseTransaction({data});
    return [decoded?.name ?? "", decoded?.args ?? []];
}

export function printArgs(target:string, functionName: string, args: any[]): string {
    switch (functionName) {
        case "createRentalAgreement":
            return (
                "Tenant: " + args[0] + "<br/>" +
                "Realty: " + args[1][0] + "<br/>" +
                "Start Date: " + args[1][1] + "<br/>" +
                "Duration: " + args[1][2] + "<br/>" +
                "Rent Value: " + args[1][3] + "<br/>" +
                "Security Deposit: " + args[1][4] + "<br/>" +
                "Security Return Due Date: " + args[1][5] + "<br/>" +
                "Payment Due Date: " + args[1][6] + "<br/>" +
                "Late Payment Fee: " + args[1][7] + "<br/>" +
                "Early Termination Fee: " + args[1][8] + "<br/>" +
                "Early Termination Notice: " + args[1][9] + "<br/>" +
                "Extra: " + args[1][10]
            );
        case "renewTerm":
            return (
                "Periods: " + args[0] + "<br/>" 
        );
        case "returnDeposit":
            return (
                "Rental: " + target + "<br/>"  + 
                "Penalty: " + args[0] + "<br/>" 
        );
        case "evict":
            return (
                "Rental: " + target + "<br/>"
        );

        default:
            return "TODO: " + functionName;
    }
}
