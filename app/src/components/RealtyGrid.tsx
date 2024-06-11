import { Pagination, PaginationItem } from "@mui/material";
import { useEffect, useState } from "react";
import { Realty, createRealty } from "../api/api";
import { ethers } from "ethers";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RealtyFactory.sol/RealtyFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { RealtyListItem } from "./RealtyListItem";

export default function RealtyGrid({user}: {user: string}) {

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
        console.log("user", user);
        const res = await realtyFactoryContract.getRealtiesOf(user);
        const fetchedRealties: Realty[] = [];
        for (const r of res) {
            const realtyDetails = await realtyFactoryContract.detailsOf(r);
            const realty : Realty = createRealty(realtyDetails);
            fetchedRealties.push(realty);
        }
        setRealties(fetchedRealties);
    }

    useEffect(() => {
        fetchRealties();
    }, []);

    useEffect(() => {
        handlePageChange(1);
    }, [realties]);

    return (
        <div>
            <div className="realtiesGrid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)"}}>
                {pageView.map((a, i) => (
                    <RealtyListItem key={i} apartment={a}/>
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
    );
}