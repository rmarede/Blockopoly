import Popup from "../components/Popup";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { ethers } from "ethers";
import { Rental } from "../api/api";
import Loader from "../components/Loader";
import { useState } from "react";
import { encodeRentalAgreementData } from "../utils/operation-encoder";

export default function EvictModal({ trigger, close, rental } : {trigger:boolean, close: (value: boolean) => void, rental:Rental}) {

    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const ownershipContract = new ethers.Contract(rental.realty, OwnershipAbi.abi, signer);

        const encodedCallData = encodeRentalAgreementData('evict', []);

        try {
            const tx = await ownershipContract.submitTransaction(rental.address, 0, encodedCallData);
            console.log(tx);
            const receipt = await tx.wait();
            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                window.alert('Transaction successful.');
                window.location.reload();
            }
        } catch (error) {
            console.log('Error with transaction:', error);
            window.alert('Transaction Failed. See console for details.');
        }
        setIsLoading(false);
    }

    return (
        <Popup trigger={trigger} close={close}>
            {isLoading ? <Loader color="#ff5e5e"/> : (
                <div style={{display:"flex", flexDirection:"column"}}>
                    <h3>Tenant Eviction</h3>
                    <p>This action will submit a transation to dump the tenant if the tenant breached the payment agreement.<br/> 
                    Execution will happen only after the majority of share owners confirm the transaction.</p>
                    <button onClick={submit} className="redButton">Evict</button>
                </div>
            )}
        </Popup>
    ) ;
}