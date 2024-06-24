import { ethers } from "ethers";
import Popup from "../components/Popup";
import ADocumentAbi from "../../../besu/src/artifacts/contracts/compliance/ADocument.sol/ADocument.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { useState } from "react";
import Loader from "../components/Loader";

export default function AddDocumentModal({ trigger, close, realtyAddr} : {trigger:boolean, close: (value: boolean) => void, realtyAddr:string}) {

    const [isLoading, setIsLoading] = useState(false);

    const addDocument = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const documentContract = new ethers.Contract(DeployedAddresses["GeneralModule#ADocument"], ADocumentAbi.abi, signer);
        try {
            const tx = await documentContract.issueDocument(realtyAddr, data.get("val1"), data.get("val2"));
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
                <form className="addDocumentModal" onSubmit={addDocument}>
                    <h2>Add Document</h2>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Val1:</label>
                            <input className="redInput" name="val1" type="text" placeholder="100" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Val2:</label>
                            <input className="redInput" name="val2" type="number" placeholder="200" required/>
                        </div>
                    </div>                    
                    <button className="redButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}