import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Popup from "../components/Popup";
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import RealtyGrid from "../components/RealtyGrid";


export default function RealtiesPage() {

    const [addPopup, setAddPopup] = useState<boolean>(false);
    const [userAddress, setUserAddress] = useState("0x0");

    const fetchUser = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUserAddress(signerAddress);
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <Popup trigger={addPopup} close={setAddPopup}>
                <h2>Add Realty</h2>
            </Popup>
            <div className="realtiesPage">
                <div style={{display:"flex", justifyContent: "space-between"}}> 
                    <h1>My Realties</h1>
                    <button className="action-button" onClick={() => setAddPopup(true)}><AddCircleOutlineRoundedIcon/></button>
                </div>
                {userAddress !== "0x0" && <RealtyGrid user={userAddress}/>}
            </div>
        </div>
    );
}