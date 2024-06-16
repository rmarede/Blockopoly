import { ethers } from "ethers";
import Popup from "../components/Popup";
import SaleFactoryAbi from "../../../besu/src/artifacts/contracts/factory/SaleAgreementFactory.sol/SaleAgreementFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { useState } from "react";
import Loader from "../components/Loader";

export default function CreateSaleModal({ trigger, close, user, realty } : {trigger:boolean, close: (value: boolean) => void, user:string, realty:string}) {

    const [isLoading, setIsLoading] = useState(false);

    const createSaleAgreement = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const saleFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#SaleAgreementFactory"], SaleFactoryAbi.abi, signer);
        const textEncoder = new TextEncoder();
        const saleDetails = {
            buyer: data.get("buyer"),
            seller: user,
            realty: realty,
            share: data.get("share"),
            price: data.get("price"),
            earnest: data.get("earnest"),
            realtor: data.get("realtor"),
            comission: data.get("comission"),
            contengencyPeriod: 10,
            contengencyClauses:  textEncoder.encode(data.get("clauses")?.toString() ?? "")
        }
        try {
            const tx = await saleFactoryContract.createSaleAgreement(saleDetails);
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
            {isLoading ? <Loader color="#e064ff"/> : (
                <form className="createSaleModal" onSubmit={createSaleAgreement}>
                    <h2>Create Sale Agreement</h2>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Share:</label>
                            <input className="pinkInput" name="share" type="number" placeholder="10000" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Price:</label>
                            <input className="pinkInput" name="price" type="number" placeholder="45000" required/>
                        </div>
                    </div>
                    <label>Buyer:</label>
                    <input className="pinkInput" name="buyer" type="text" placeholder="0x0123456789" required/>
                    <label>Realtor:</label>
                    <input className="pinkInput" name="realtor" type="text" placeholder="0x0123456789"/>
                    <div style={{display:"flex", gap:"1em", width:"100%"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Comission:</label>
                            <input className="pinkInput" name="comission" type="number" placeholder="100"/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Earnest:</label>
                            <input className="pinkInput" name="earnest" type="number" placeholder="5000" required/>
                        </div>
                    </div>
                    <label>Contingency Clauses:</label>
                    <input className="pinkInput" name="clauses" type="text" placeholder="p.e. the house shall not smell, etc."/>
                    <button className="pinkButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}