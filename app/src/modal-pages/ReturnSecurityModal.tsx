import Popup from "../components/Popup";
import RentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json";
import { ethers } from "ethers";

export default function ReturnSecurityModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {

    const submit = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const rentalContract = new ethers.Contract(address, RentalAgreementAbi.abi, provider);
    }

    return (
        <Popup trigger={trigger} close={close}>
            <h1>in {address}</h1>
        </Popup>
    ) ;
}