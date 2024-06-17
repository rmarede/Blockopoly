import Popup from "../components/Popup";
import RentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json";
import WalletAbi from "../../../besu/src/artifacts/contracts/Wallet.sol/Wallet.json";
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { ethers } from "ethers";
import { Rental } from "../api/api";
import { bigIntToFloatString } from "../utils/unit-conversion";
import { useState } from "react";
import Loader from "../components/Loader";

export default function RentalEnrollModal({ trigger, close, rental } : {trigger:boolean, close: (value: boolean) => void, rental:Rental}) {

    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        try {
            const walletContract = new ethers.Contract(DeployedAddresses["WalletModule#Wallet"], WalletAbi.abi, signer);
            const rentalContract = new ethers.Contract(rental.address, RentalAgreementAbi.abi, signer);
            let tx = await walletContract.approve(rental.address, rental.rentValue + rental.securityDeposit);
            let receipt = await tx.wait();
            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                tx = await rentalContract.enroll();
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
                <div style={{display:"flex", flexDirection:"column"}}>
                    <h3>Enroll in this Rental Contract?</h3>
                    <p>This action will transfer to the landlord(s) the amount equivalent <br/> 
                    to the rent value ({bigIntToFloatString(rental?.rentValue)}$) and security deposit ({bigIntToFloatString(rental?.securityDeposit)}$)</p>
                    <p>Two different transactions will take place.</p>
                    <button onClick={submit} className="redButton">Enroll</button>
                </div>
            )}
        </Popup>
    ) ;
}