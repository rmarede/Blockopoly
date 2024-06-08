import Navbar from "../components/Navbar";

import WalletAbi from "../../../besu/src/artifacts/contracts/Wallet.sol/Wallet.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function WalletPage() {

    /*
    const provider = new ethers.JsonRpcProvider("http://localhost:8500");
    const wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
    const signer = wallet.connect(provider);

    const cns = new ethers.Contract(getAddress.contractNameServiceAddress(), getAbi.cnsAbi(), signer);
    */

    const [balance, setBalance] = useState(0);
    const [userAddress, setUserAddress] = useState("0x0");

    const fetchUserBalance = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const walletContract = new ethers.Contract(DeployedAddresses["WalletModule#Wallet"], WalletAbi.abi, provider);
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
        const walletContract = new ethers.Contract(DeployedAddresses["WalletModule#Wallet"], WalletAbi.abi, signer);
        const tx = await walletContract.mint(data.get("destinatary"), data.get("amount"));
        console.log(tx);
    }

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <h1>Wallet Page</h1>
            <p>Balance: {balance}</p>
            <p>Address: {userAddress}</p>
            <div>
                <form onSubmit={mintCurrency}>
                    <label>Amount:</label>
                    <input name="amount" type="number" placeholder="100"/>
                    <label>To:</label>
                    <input name="destinatary" type="text" placeholder="0x123..456"/>
                    <button type="submit">Mint</button>
                </form>
            </div>
        </div>
    )
}