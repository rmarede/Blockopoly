import Popup from "../components/Popup";
import RentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json";
import WalletAbi from "../../../besu/src/artifacts/contracts/Wallet.sol/Wallet.json";
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { ethers } from "ethers";
import { Rental } from "../api/api";
import { useState } from "react";
import Loader from "../components/Loader";
import { bigIntToFloatString } from "../utils/unit-conversion";

export default function EarlyTerminationModal({ trigger, close, rental } : {trigger:boolean, close: (value: boolean) => void, rental:Rental}) {

    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        try {
            const walletContract = new ethers.Contract(DeployedAddresses["WalletModule#Wallet"], WalletAbi.abi, signer);
            const rentalContract = new ethers.Contract(rental.address, RentalAgreementAbi.abi, signer);
            let tx = await walletContract.approve(rental.address, rental.earlyTerminationFee);
            let receipt = await tx.wait();
            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                tx = await rentalContract.reduceTerm(data.get("periods"));
                receipt = await tx.wait();
                if (!receipt.status) {
                    console.log('Error with transaction: ', receipt);
                    window.alert('Transaction Failed. See console for details.');
                } else {
                    window.alert('Transaction successful.');
                    close(false);
                }
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
                    <h2>Anticipate Contract Termination</h2>
                    <p>Early contract termination is subject to the early termination fee ({bigIntToFloatString(rental?.earlyTerminationFee)}$)<br/>
                    defined within the contract terms. This action will trigger two transactions. </p>
                    <p>Periods left: TODO</p>
                    <label>Periods (of 30 days):</label>
                    <input className="blueInput" name="periods" type="number" placeholder="6" required/>
                    <button className="blueInput submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}