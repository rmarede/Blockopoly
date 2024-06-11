import { Pagination, PaginationItem } from "@mui/material";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Realty } from "../api/api";
import { ethers } from "ethers";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RealtyFactory.sol/RealtyFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { RealtyListItem } from "../components/RealtyListItem";
import Popup from "../components/Popup";
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';


export default function RealtiesPage() {

    const pageSize = 12;
    const [pageView, setPageView] = useState<Realty[]>([]);
    const [realties, setRealties] = useState<Realty[]>([]);
    const [addPopup, setAddPopup] = useState<boolean>(false);

    const handlePageChange = (pageNumber: number) => {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;

        setPageView(realties.slice(start, end));
    };

    const fetchRealties = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const realtyFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#RealtyFactory"], RealtyFactoryAbi.abi, provider);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const res1 = await realtyFactoryContract.getRealtiesOf(signerAddress);
        console.log(res1);
        const res = [
            {name: "Realty 1", ownership: "Owner 1", kind: "Apartment", district: "District 1", location: "Location 1", image: "https://via.placeholder.com/150", totalArea: "100"},
            {name: "Realty 2", ownership: "Owner 2", kind: "Apartment", district: "District 2", location: "Location 2", image: "https://via.placeholder.com/150", totalArea: "200"},
            {name: "Realty 3", ownership: "Owner 3", kind: "Apartment", district: "District 3", location: "Location 3", image: "https://via.placeholder.com/150", totalArea: "300"},
            {name: "Realty 4", ownership: "Owner 4", kind: "Apartment", district: "District 4", location: "Location 4", image: "https://via.placeholder.com/150", totalArea: "400"},
            {name: "Realty 5", ownership: "Owner 5", kind: "Apartment", district: "District 5", location: "Location 5", image: "https://via.placeholder.com/150", totalArea: "500"},
            {name: "Realty 6", ownership: "Owner 6", kind: "Apartment", district: "District 6", location: "Location 6", image: "https://via.placeholder.com/150", totalArea: "600"},];
        setRealties(res);
    }

    useEffect(() => {
        fetchRealties();
    }, []);

    useEffect(() => {
        handlePageChange(1);
    }, [realties]);

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
                <div className="realtiesGrid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)"}}>
                    {pageView.map((a, i) => (
                        <div key={i}>
                            <RealtyListItem key={i} apartment={a}/>
                        </div>
                    ))}
                </div>
                <div style={{display:"flex", justifyContent:"center", alignItems:"center", marginTop: "4rem"}}>
                    <Pagination
                    count={Math.ceil(realties.length / pageSize)}
                    variant="outlined"
                    renderItem={(item) => 
                        <PaginationItem {...item} sx={{
                            color: "white",
                            "&.Mui-selected": {
                                backgroundColor: "#ff5e5e"
                            },
                            border: "2px solid #ff5e5e",
                        }} />}
                    onChange={(_, page) => handlePageChange(page)}
                    />
                </div>
            </div>
        </div>
    );
}