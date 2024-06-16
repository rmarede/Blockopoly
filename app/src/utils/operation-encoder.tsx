import { ethers } from "ethers";
import rentalFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RentalAgreementFactory.sol/RentalAgreementFactory.json"

export default function encodeRentalFactoryData(functionToCall: string, params: any[]) {
    const itf = new ethers.Interface(rentalFactoryAbi.abi);
    const data = itf.encodeFunctionData(functionToCall, params);
    return data;
}
