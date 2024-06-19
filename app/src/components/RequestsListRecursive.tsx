import { useEffect, useState } from "react";
import { OperationRequest, createOperationRequest } from "../api/api";
import { ethers } from "ethers";
import IMultisigAbi from "../../../besu/src/artifacts/contracts/interface/governance/IMultisig.sol/IMultisig.json"
import { printArgs } from "../utils/operation-encoder";
import { Pagination, PaginationItem } from "@mui/material";
import Loader from "./Loader";

export default function RequestsListTenant({of}: {of: string}) {

    const pageSize = 1;
    const [pageView, setPageView] = useState<OperationRequest[]>([]);
    const [requests, setRequests] = useState<OperationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handlePageChange = (pageNumber: number) => {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;

        setPageView(requests.slice(start, end));
    };

    const fetchRequests = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const multisigContract = new ethers.Contract(of, IMultisigAbi.abi, provider);

        const reqNum = await multisigContract.getTransactionCount();
        const requests: OperationRequest[] = [];
        
        for (let i = 0; i < Number(reqNum); i++) {
            const req = await multisigContract.getTransaction(i);
            console.log(req);
            requests.push(await createOperationRequest(req, i));
        }
        setRequests(requests);
    }

    const approve = async (id: number) => {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        try {
            const multisigContract = new ethers.Contract(of, IMultisigAbi.abi, signer);
            const tx = await multisigContract.confirmTransaction(id);
            const receipt = await tx.wait();
            if (!receipt.status) {
                console.log('Error with transaction: ', receipt);
                window.alert('Transaction Failed. See console for details.');
            } else {
                window.alert('Transaction successful.');
            }
        } catch (error) {
            console.log('Error with transaction:', error);
            window.alert('Transaction Failed. See console for details.');
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        handlePageChange(1);
    }, [requests]);

    return (
        <>
            {isLoading ? <Loader color="#ff5e5e"/> : ( 
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
                                    <td dangerouslySetInnerHTML={{ __html: printArgs(item.target, item.name, item.args)}}></td>
                                    <td>{item.executed.toString()}</td>
                                    <td><button className="redButton" disabled={item.executed} onClick={() => approve(item.id)}>Request Approval</button></td>
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
            )}
        </>
        
    )
}