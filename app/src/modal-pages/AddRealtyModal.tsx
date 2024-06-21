import { ethers } from "ethers";
import Popup from "../components/Popup";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RealtyFactory.sol/RealtyFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { useState } from "react";
import Loader from "../components/Loader";

export default function AddRealtyModal({ trigger, close, user} : {trigger:boolean, close: (value: boolean) => void, user:string}) {

    const [isLoading, setIsLoading] = useState(false);

    const addRealty = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const realtyFactoryContract = new ethers.Contract(DeployedAddresses["GeneralModule#RealtyFactory"], RealtyFactoryAbi.abi, signer);
        const realtyDetails = {
            name: data.get("realtyName"),
            ownership: user,
            kind: data.get("kind"),
            district: data.get("district"),
            location: data.get("location"),
            image: data.get("image"),
            totalArea: BigInt(Number(data.get("area")))
        }
        console.log(realtyDetails);
        try {
            const tx = await realtyFactoryContract.mint(realtyDetails, [user], [10000]);
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
                <form className="addRealtyModal" onSubmit={addRealty}>
                    <h2>Add Realty</h2>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Name:</label>
                            <input className="redInput" name="realtyName" type="text" placeholder="JYP Building" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Kind:</label>
                            <input className="redInput" name="kind" type="text" placeholder="BUILDING" required/>
                        </div>
                    </div>
                    <label>Location:</label>
                    <input className="redInput" name="location" type="text" placeholder="Korean Avenue 25" required/>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>District:</label>
                            <input className="redInput" name="district" type="text" placeholder="Seoul" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Total Area (m2):</label>
                            <input className="redInput" name="area" type="number" placeholder="120" required/>
                        </div>
                    </div>
                    <label>ImageURL:</label>
                    <input className="redInput" name="image" type="text" placeholder="https://jyp.com/building.png" required/>
                    
                    <button className="redButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}