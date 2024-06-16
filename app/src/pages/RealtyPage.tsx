import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { Realty, createRealty } from "../api/api";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RealtyFactory.sol/RealtyFactory.json"
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { bigIntToFloatString } from "../utils/unit-conversion";
import TxHistoryModal from "../modal-pages/TxHistoryModal";
import TransferModal from "../modal-pages/TransferModal";
import CreateSaleModal from "../modal-pages/CreateSaleModal";
import CreateRentalModal from "../modal-pages/CreateRentalModal";
import CheckRequestsModal from "../modal-pages/CheckRequestsModal";

export default function RealtyPage() {
    const params = useParams<{id:string}>();
    const [realty, setRealty] = useState<Realty | undefined>(undefined);
    const [shareOf, setShareOf] = useState<number>(0);
    const [user, setUser] = useState<string>("");
    const [ownershipInfo, ] = useState(new Map());

    const [historyPopup, setHistoryPopup] = useState<boolean>(false);
    const [transferPopup, setTransferPopup] = useState<boolean>(false);
    const [salePopup, setSalePopup] = useState<boolean>(false);
    const [rentPopup, setRentPopup] = useState<boolean>(false);
    const [requestsPopup, setRequestsPopup] = useState<boolean>(false);

    const fetchRealty = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
        const realtyFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#RealtyFactory"], RealtyFactoryAbi.abi, provider);
        const realtyDetails = await realtyFactoryContract.detailsOf(params.id);
        setRealty(createRealty(realtyDetails));

        const ownershipContract = new ethers.Contract(realtyDetails.ownership, OwnershipAbi.abi, provider);
        const shareOf = await ownershipContract.shareOf(signerAddress);
        const participants = await ownershipContract.getParticipants();
        for (const p of participants) {
            const share = await ownershipContract.shareOf(p);
            ownershipInfo.set(p, share);
        }
        setShareOf(shareOf);
    }

    useEffect(() => {
        fetchRealty();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <TxHistoryModal trigger={historyPopup} close={setHistoryPopup} address={realty?.ownership ?? ""}/>
            <TransferModal trigger={transferPopup} close={setTransferPopup}  user={user} realty={realty?.ownership ?? ""}/>
            <CreateSaleModal trigger={salePopup} close={setSalePopup} user={user} realty={realty?.ownership ?? ""}/>
            <CreateRentalModal trigger={rentPopup} close={setRentPopup} address={realty?.ownership ?? ""}/>
            <CheckRequestsModal trigger={requestsPopup} close={setRequestsPopup} address={realty?.ownership ?? ""}/>
            <div className="page realtyPage" style={{ display: "flex"}}>
                <div className="realtyInfo">
                    <div className="realtyImage" style={{backgroundImage: `url(${realty?.image})`}}></div>
                    <h1>{realty?.name}</h1>
                    <p>{realty?.location}</p>
                    <p>ID/Address: {realty?.ownership}</p>
                    <p>Total Area: {realty?.totalArea.toString()} m2</p>
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...ownershipInfo].map((item) => (
                                <tr key={item[0]}>
                                    <td>{(item[0] == user) ? "You" : item[0]}</td>
                                    <td>{bigIntToFloatString(item[1])}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {shareOf > 0 && 
                    <div className="realtyActions">
                        <button className="redButton" onClick={() => setHistoryPopup(true)}>Transaction History</button>
                        <button className="redButton" onClick={() => setTransferPopup(true)}>Transfer Ownership</button>
                        <button className="pinkButton" onClick={() => setSalePopup(true)}>Create Sale Agreement</button>
                        <button className="blueButton" onClick={() => setRentPopup(true)}>Create Rental Agreement</button>
                        <button className="whiteButton" onClick={() => setRequestsPopup(true)}>Check Requests</button>
                    </div>
                }
            </div>
        </div>
    )
}