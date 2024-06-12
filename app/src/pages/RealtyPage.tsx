import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { Realty, createRealty } from "../api/api";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RealtyFactory.sol/RealtyFactory.json"
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"

export default function RealtyPage() {
    const params = useParams<{id:string}>();
    const [realty, setRealty] = useState<Realty | undefined>(undefined);
    const [shareOf, setShareOf] = useState<number>(0);
    const [user, setUser] = useState<string>("");
    const [ownershipInfo, setOwnershipInfo] = useState(new Map());

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
            <div className="realtyPage" style={{ display: "flex"}}>
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
                                    <td>{parseFloat((Number(item[1])/100).toFixed(2)).toString()}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {shareOf > 0 && 
                    <div className="realtyActions">
                        <button className="historyBtn">Transaction History</button>
                        <button className="txBtn">Transfer Ownership</button>
                        <button className="saleBtn">Create Sale Agreement</button>
                        <button className="rentBtn">Create Rental Agreement</button>
                    </div>
                }
            </div>
        </div>
    )
}