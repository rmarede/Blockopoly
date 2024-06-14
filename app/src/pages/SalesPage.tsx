import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { ethers } from "ethers";
import SaleList from "../components/SaleList";

export default function SalesPage() {

    const [user, setUser] = useState<string>("0x0");

    const fetchUser = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div className="salesPage">
                <h1>My Sales</h1>
                {user !== "0x0" && <SaleList of={user}/>}
            </div>
        </div>
    )
}