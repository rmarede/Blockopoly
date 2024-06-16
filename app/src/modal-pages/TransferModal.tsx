import { ethers } from "ethers";
import Popup from "../components/Popup";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { useState } from "react";
import Loader from "../components/Loader";

export default function TransferModal({ trigger, close, user, realty } : {trigger:boolean, close: (value: boolean) => void, user:string, realty:string}) {

    const [isLoading, setIsLoading] = useState(false);

    const transfer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const ownershipContract = new ethers.Contract(realty, OwnershipAbi.abi, signer);
        try {
            const tx = await ownershipContract.transferShares(user, data.get("destinatary"), data.get("share"));
            console.log(tx);
            const receipt = await tx.wait();
            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                window.alert('Transaction successful.');
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
                <form className="transferModal" onSubmit={transfer}>
                    <h2>Transfer Property</h2>
                    <label>To:</label>
                    <input className="redInput" name="destinatary" type="text" placeholder="0x0123456789" required/>
                    <label>Share:</label>
                    <input className="redInput" name="share" type="number" placeholder="1000" required/>
                    <button className="redButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}