import Popup from "../components/Popup";
import RentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json";
import { ethers } from "ethers";
import { Rental } from "../api/api";
import { useState } from "react";
import Loader from "../components/Loader";

export default function RenewalModal({ trigger, close, rental } : {trigger:boolean, close: (value: boolean) => void, rental:Rental}) {

    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        try {
            const rentalContract = new ethers.Contract(rental.address, RentalAgreementAbi.abi, signer);
            const tx = await rentalContract.renewTerm(data.get("periods"));
            const receipt = await tx.wait();
            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                window.alert('Transaction successful.');
                close(false);
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
                <form className="renewalModal" onSubmit={submit}>
                    <h2>Request Contract Term Renewal</h2>
                    <p>This action will create a request for term renewal.<br/>
                    Only if the other party approves it will take place.</p>
                    <p>Current Contract Duration: {rental?.duration.toString()}</p>
                    <label>Periods (of 30 days):</label>
                    <input className="blueInput" name="periods" type="number" placeholder="6" required/>
                    <button className="blueButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}