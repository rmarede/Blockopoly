import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { ethers } from "ethers";
import RentalList from "../components/RentalList";

export default function RentalsPage() {

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
            <div className="page rentalsPage">
                <h1>My Rentals</h1>
                {user !== "0x0" && <RentalList of={user}/>}
            </div>
        </div>
    )
}