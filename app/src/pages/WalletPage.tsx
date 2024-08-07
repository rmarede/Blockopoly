import Navbar from "../components/Navbar";

import WalletAbi from "../../../besu/src/artifacts/contracts/Wallet.sol/Wallet.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { numberToFloatString } from "../utils/unit-conversion";
import MortgageList from "../components/MortgageList";

export default function WalletPage() {

    const [balance, setBalance] = useState(0);
    const [userAddress, setUserAddress] = useState("0x0");

    const fetchUserBalance = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const walletContract = new ethers.Contract(DeployedAddresses["GeneralModule#Wallet"], WalletAbi.abi, provider);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUserAddress(signerAddress);
        const res = await walletContract.balanceOf(signerAddress);
        setBalance(parseInt(res));
    }
    
    useEffect(() => {
        fetchUserBalance();
    }, []);

    const mintCurrency = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const walletContract = new ethers.Contract(DeployedAddresses["GeneralModule#Wallet"], WalletAbi.abi, signer);
        const tx = await walletContract.mint(data.get("destinatary"), data.get("amount"));
        console.log(tx);
    }

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <div className="page walletPage">
                <div>
                    <h1>My Wallet</h1>
                    <div>
                        <p>User: {userAddress}</p>
                        <p>Your Balance: {numberToFloatString(balance)}$</p>
                    </div>
                    <h2>My Loans</h2>
                    {userAddress !== "0x0" && <MortgageList of={userAddress}/>}
                </div>
                <div className="walletActions">
                    <form onSubmit={mintCurrency}>
                        <h2>Mint Currency</h2>
                        <label>Amount:</label>
                        <input name="amount" type="number" placeholder="100"/>
                        <label>To:</label>
                        <input name="destinatary" type="text" placeholder="0x123..456"/>
                        <button className="yellowButton" type="submit">Mint</button>
                    </form>
                </div>
            </div>
        </div>
    )
}