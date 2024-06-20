import Popup from "../components/Popup";
import SaleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json";
import { ethers } from "ethers";
import { Sale } from "../api/api";
import { useState } from "react";
import Loader from "../components/Loader";

export default function WithdrawModal({ trigger, close, sale } : {trigger:boolean, close: (value: boolean) => void, sale:Sale}) {

    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        try {
            const saleContract = new ethers.Contract(sale.address, SaleAgreementAbi.abi, signer);
            const tx = await saleContract.withdraw(data.get("penalty"));
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
                    <h3>Withdraw from this sale agreement?</h3>
                    <p>Upon both parties withdraw, this action will transfer the shares back<br/> 
                    to the seller, and the earnest to the buyer minus the determined penalty.</p>
                    <label>Penalty (in cents):</label>
                    <input className="redInput" name="penalty" type="number" placeholder="10000" required/>
                    <button className="redButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}