import { ethers } from "ethers";
import Popup from "../components/Popup";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json";
import { useState } from "react";
import Loader from "../components/Loader";
import {encodeRentalFactoryData} from "../utils/operation-encoder";

export default function CreateRentalModal({ trigger, close, realty } : {trigger:boolean, close: (value: boolean) => void, realty:string}) {
    
    const [isLoading, setIsLoading] = useState(false);

    const createRental = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const ownershipContract = new ethers.Contract(realty, OwnershipAbi.abi, signer);

        const terms = {
            realtyContract: realty,
            startDate: data.get("startDate"),
            duration: data.get("duration"), 
            rentValue: data.get("rentValue"),
            securityDeposit: data.get("deposit"),
            securityReturnDueDate: 15,
            paymentDueDate: data.get("paymentDueDate"),
            latePaymentFee: data.get("latePaymentFee"),
            earlyTerminationFee: data.get("terminationNotice"), 
            earlyTerminationNotice: data.get("terminationFee"),
            extra: 'extra terms', 
            payees: [], 
            shares: []
        };

        const encodedCallData = encodeRentalFactoryData('createRentalAgreement', [data.get("tenant"), terms]);

        try {
            const tx = await ownershipContract.submitTransaction(DeployedAddresses["FactoryModule#RentalAgreementFactory"], 0, encodedCallData);
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
                <form className="createRentalModal" onSubmit={createRental}>
                    <h2>Create Rental Agreement</h2>
                    <label>Tenant Account:</label>
                    <input className="blueInput" name="tenant" type="text" placeholder="0x0123456789" required/>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Monthly Rent (cents):</label>
                            <input className="blueInput" name="rentValue" type="number" placeholder="25000" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Security Deposit (cents):</label>
                            <input className="blueInput" name="deposit" type="number" placeholder="20000" required/>
                        </div>
                    </div>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Start Date:</label>
                            <input className="blueInput" name="startDate" type="number" placeholder="25000" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Duration (months):</label>
                            <input className="blueInput" name="duration" type="number" placeholder="6 months" required/>
                        </div>
                    </div>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Payment Due Date (nth):</label>
                            <input className="blueInput" name="paymentDueDate" type="number" placeholder="1" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Late Payment Fee:</label>
                            <input className="blueInput" name="latePaymentFee" type="number" placeholder="5000" required/>
                        </div>
                    </div>
                    <div style={{display:"flex", gap:"1em"}}>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Early Termination Notice:</label>
                            <input className="blueInput" name="terminationNotice" type="number" placeholder="1 month" required/>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <label>Early Termination Fee:</label>
                            <input className="blueInput" name="terminationFee" type="number" placeholder="5000" required/>
                        </div>
                    </div>

                    <button className="blueButton submitButton" type="submit">Submit</button>
                </form>
            )}
        </Popup>
    ) ;
}