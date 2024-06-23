import Popup from "../components/Popup";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { ethers } from "ethers";
import { Rental } from "../api/api";
import { useState } from "react";
import Loader from "../components/Loader";
import { encodeRentalAgreementData } from "../utils/operation-encoder";

export default function ReturnSecurityModal({ trigger, close, rental } : {trigger:boolean, close: (value: boolean) => void, rental:Rental}) {

    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const ownershipContract = new ethers.Contract(rental.realty, OwnershipAbi.abi, signer);

        const encodedCallData = encodeRentalAgreementData('returnDeposit', [data.get("penalty")]);

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
                <form className="returnSecurityModal" onSubmit={submit}>
                    <h2>Return Security Deposit</h2>
                    <p>This action will submit a transaction request to the property's ownership consortium.<br/>
                    Execution will happen only after the majority of share owners confirm the transaction.</p>
                    <label>Penalty:</label>
                    <input className="blueInput" name="penalty" type="number" placeholder="0" required/>
                    <button className="blueButton submitButton" type="submit">Submit Request</button>
                </form>
            )}
        </Popup>
    ) ;
}