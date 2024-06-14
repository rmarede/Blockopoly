import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { Sale, createSale } from "../api/api";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import SaleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { bigIntToFloatString } from "../utils/unit-conversion";
import WalletAbi from "../../../besu/src/artifacts/contracts/Wallet.sol/Wallet.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { saleStatusColor, saleStatusName } from "../utils/status-converter";

export default function SalePage() {
    const params = useParams<{id:string}>();
    const [sale, setSale] = useState<Sale | undefined>(undefined);
    const [user, setUser] = useState<string>("");
    const [escrowBalance, setEscrowBalance] = useState<bigint>(0n);
    const [escrowShares, setEscrowShares] = useState<bigint>(0n);

    const fetchSale = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
        const saleContract = new ethers.Contract(params.id ?? "", SaleAgreementAbi.abi, provider);
        const saleDetails = await saleContract.details();
        const saleStatus = Number(await saleContract.status());
        setSale(createSale(saleDetails, params.id ?? "", saleStatus));
        const walletContract = new ethers.Contract(DeployedAddresses["WalletModule#Wallet"], WalletAbi.abi, provider);
        const balance = await walletContract.balanceOf(params.id);
        setEscrowBalance(balance);
        const ownershipContract = new ethers.Contract(saleDetails.realty, OwnershipAbi.abi, provider);
        const shareOf = await ownershipContract.shareOf(params.id);
        setEscrowShares(shareOf);
    }

    useEffect(() => {
        fetchSale();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <div className="salePage" style={{ display: "flex"}}>
                <div>
                    <div style={{ display: "flex"}}>
                        <h1>Sale Agreement</h1>
                        <h2 style={{ marginLeft: "10px", color: saleStatusColor(sale?.status ?? 4)}}>{saleStatusName(sale?.status ?? 4)}</h2>
                    </div>
                    <h2>{sale?.address}</h2>
                    <div className="saleInfo">
                        <div className="txParties" style={{ display: "flex"}}>
                            <InfoCard title={sale?.seller === user ? "Seller (You)" : "Seller"}>
                                <p>{sale?.seller}</p>
                            </InfoCard>
                            <ArrowForwardIcon/>
                            <InfoCard title={sale?.buyer === user ? "Buyer (You)" : "Buyer"}>
                                <p>{sale?.buyer}</p>
                            </InfoCard>
                        </div>
                        <InfoCard title="Transaction Details">
                            <p>Realty: <Link to={`/realties/${sale?.realty}`}>{sale?.realty}</Link></p>
                            <p>Share: {bigIntToFloatString(sale?.share ?? 0n)}%</p>
                            <p>Price: {bigIntToFloatString(sale?.price ?? 0n)}$</p>
                            <p>Earnest: {bigIntToFloatString(sale?.earnest ?? 0n)}$</p>
                            <p>Realtor: {sale?.realtor}</p>
                            <p>Comission: {bigIntToFloatString(sale?.comission ?? 0n)}$</p>
                            <p>Contengency Period: {sale?.contengencyPeriod.toString()} days</p>
                        </InfoCard>
                    </div>
                </div>
                {(sale?.buyer === user || sale?.seller === user) && 
                    <div className="saleActions">
                        <h3>Assets Hold In Escrow</h3>
                        <p>Balance hold from buyer: {bigIntToFloatString(escrowBalance)}$</p>
                        <p>Shares hold from seller: {bigIntToFloatString(escrowShares)}%</p>
                        <div className="saleButtons">
                            <button disabled={sale.status != 0}>Consent</button>
                            <button disabled={sale.status != 1}>Commit</button>
                            <button disabled={sale.status == 2 || sale.status == 3} className="redButton">Withdraw</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

function InfoCard({ title,  children } : { title: string, children: React.ReactNode }) {
    return (
        <div className="infoCard">
            <h3 className="title">{title}</h3>
            {children}
        </div>
    )
}

