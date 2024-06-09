import { Pagination, PaginationItem } from "@mui/material";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Realty } from "../api/api";
import { ethers } from "ethers";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/RealtyFactory.sol/RealtyFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { RealtyListItem } from "../components/RealtyListItem";


export default function RealtiesPage() {

    const pageSize = 12;
    const [pageView, setPageView] = useState<Realty[]>([]);
    const [realties, setRealties] = useState<Realty[]>([]);

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
            {id: 1, name: "House", location: "New York"},
            {id: 2, name: "Apartment", location: "New York"},
            {id: 3, name: "House", location: "New York"},
            {id: 4, name: "Apartment", location: "New York"},
            {id: 5, name: "House", location: "New York"},
            {id: 6, name: "Apartment", location: "New York"},
            {id: 7, name: "House", location: "New York"},
            {id: 8, name: "Apartment", location: "New York"},
            {id: 9, name: "House", location: "New York"},
            {id: 10, name: "Apartment", location: "New York"},
            {id: 11, name: "House", location: "New York"},
            {id: 12, name: "Apartment", location: "New York"},
            {id: 13, name: "House", location: "New York"},
            {id: 14, name: "Apartment", location: "New York"},
            {id: 15, name: "House", location: "New York"},
            {id: 16, name: "Apartment", location: "New York"},
            {id: 17, name: "House", location: "New York"},
            {id: 18, name: "Apartment", location: "New York"},
            {id: 19, name: "House", location: "New York"},
            {id: 20, name: "Apartment", location: "New York"},
            {id: 21, name: "House", location: "New York"},
            {id: 22, name: "Apartment", location: "New York"},
            {id: 23, name: "House", location: "New York"},
            {id: 24, name: "Apartment", location: "New York"},
            {id: 25, name: "House", location: "New York"},
            {id: 26, name: "Apartment", location: "New York"},
            {id: 27, name: "House", location: "New York"}];
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
            <div className="realtiesPage">
                <div style={{display:"flex", justifyContent: "space-between"}}> 
                    <h1>My Realties</h1>
                    <button>+</button>
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
                                backgroundColor: "#646cff"
                            },
                            border: "2px solid #646cff",
                        }} />}
                    onChange={(_, page) => handlePageChange(page)}
                    />
                </div>
            </div>
        </div>
    );
}