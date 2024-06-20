import Popup from "../components/Popup";
import SaleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json";
import WalletAbi from "../../../besu/src/artifacts/contracts/Wallet.sol/Wallet.json";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json";
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { ethers } from "ethers";
import { Sale } from "../api/api";
import { bigIntToFloatString } from "../utils/unit-conversion";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

export default function ConsentModal({ trigger, close, sale } : {trigger:boolean, close: (value: boolean) => void, sale:Sale}) {

    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<string>("");

    const fetchUser = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
    }

    const submit = async () => {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        try {
            let receipt;
            const saleContract = new ethers.Contract(sale.address, SaleAgreementAbi.abi, signer);
            if (user === sale.buyer) {
                const walletContract = new ethers.Contract(DeployedAddresses["WalletModule#Wallet"], WalletAbi.abi, signer);
                const tx = await walletContract.approve(sale.address, sale.earnest);
                receipt = await tx.wait();
            } else if (user === sale.seller) {
                const ownershipContract = new ethers.Contract(sale.realty, OwnershipAbi.abi, signer);
                const tx = await ownershipContract.approve(sale.address);
                receipt = await tx.wait();
            }

            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                const tx = await saleContract.consent();
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

    useEffect(() => {
        fetchUser();
    }, []);


    return (
        <Popup trigger={trigger} close={close}>
            {isLoading ? <Loader color="#ff5e5e"/> : (
                <div style={{display:"flex", flexDirection:"column"}}>
                    <h3>Consent with this sale agreement?</h3>
                    {(user === sale?.buyer) && 
                        <p>Upon both parties consent, this action will hold in escrow <br/> 
                        the amount equivalent to the earnest value defined in the contract ({bigIntToFloatString(sale?.earnest)}$).</p>}
                    {(user === sale?.seller) && 
                        <p>Upon both parties consent, this action will hold in escrow <br/> 
                        the realty shares defined in the contract ({bigIntToFloatString(sale?.share)}%).</p>}
                    
                    <p>Two different transactions will take place.</p>
                    <button onClick={submit} className="redButton">Submit</button>
                </div>
            )}
        </Popup>
    ) ;
}