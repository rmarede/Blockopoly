import { useEffect, useState } from "react";
import { OperationRequest, createOperationRequest } from "../api/api";
import { ethers } from "ethers";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { printArgs } from "../utils/operation-encoder";
import { Pagination, PaginationItem } from "@mui/material";

export default function RequestsList({of}: {of: string}) {

    const pageSize = 1;
    const [pageView, setPageView] = useState<OperationRequest[]>([]);
    const [requests, setRequests] = useState<OperationRequest[]>([]);

    const handlePageChange = (pageNumber: number) => {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;

        setPageView(requests.slice(start, end));
    };

    const fetchRequests = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const ownershipContract = new ethers.Contract(of, OwnershipAbi.abi, provider);

        const reqNum = await ownershipContract.transactionCount();
        const requests: OperationRequest[] = [];
        
        for (let i = 0; i < Number(reqNum); i++) {
            const req = await ownershipContract.getTransaction(i);
            console.log(req);
            requests.push(createOperationRequest(req, i));
        }
        setRequests(requests);
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        handlePageChange(1);
    }, [requests]);

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Operation</th>
                        <th>Args</th>
                        <th>Executed</th>
                    </tr>
                </thead>
                <tbody>
                    {pageView.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td dangerouslySetInnerHTML={{ __html: printArgs(item.name, item.args)}}></td>
                            <td>{item.executed.toString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{display:"flex", justifyContent:"center", alignItems:"center", marginTop: "4rem"}}>
                <Pagination
                    count={Math.ceil(requests.length / pageSize)}
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
        </>
        
    )
}