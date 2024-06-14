import { ethers } from "ethers";
import Popup from "../components/Popup";
import SaleFactoryAbi from "../../../besu/src/artifacts/contracts/factory/SaleAgreementFactory.sol/SaleAgreementFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"

export default function CreateSaleModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {

    const createSaleAgreement = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const saleFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#SaleAgreementFactory"], SaleFactoryAbi.abi, signer);
        const tx = await saleFactoryContract.mint(data.get("destinatary"), data.get("amount"));
        console.log(tx);
    }
    
    return (
        <Popup trigger={trigger} close={close}>
            <form onSubmit={createSaleAgreement}>
                <h2>Create Sale Agreement</h2>
                <div style={{display:"flex", gap:"1em"}}>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <label>Share:</label>
                        <input className="pinkInput" name="share" type="number" placeholder="10000"/>
                    </div>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <label>Price:</label>
                        <input className="pinkInput" name="price" type="number" placeholder="45000"/>
                    </div>
                </div>
                <label>Buyer:</label>
                <input className="pinkInput" name="destinatary" type="text" placeholder="0x0123456789"/>
                <label>Realtor:</label>
                <input className="pinkInput" name="realtor" type="text" placeholder="0x0123456789"/>
                <div style={{display:"flex", gap:"1em", width:"100%"}}>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <label>Comission:</label>
                        <input className="pinkInput" name="comission" type="number" placeholder="100"/>
                    </div>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <label>Earnest:</label>
                        <input className="pinkInput" name="earnest" type="number" placeholder="5000"/>
                    </div>
                </div>
                <label>Contingency Clauses:</label>
                <input className="pinkInput" name="clauses" type="text" placeholder="p.e. the house shall not smell, etc."/>
                <button className="pinkButton" type="submit">Submit</button>
            </form>
        </Popup>
    ) ;
}