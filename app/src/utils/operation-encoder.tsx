import { ethers } from "ethers";
import rentalFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RentalAgreementFactory.sol/RentalAgreementFactory.json"

export function encodeRentalFactoryData(functionToCall: string, params: any[]) {
    const itf = new ethers.Interface(rentalFactoryAbi.abi);
    const data = itf.encodeFunctionData(functionToCall, params);
    return data;
}

export function decodeFunctionData(data:string) : [string, any[]] {
    const itf = new ethers.Interface(rentalFactoryAbi.abi);
    const decoded = itf.parseTransaction({data});
    return [decoded.name, decoded.args[1]];
}
