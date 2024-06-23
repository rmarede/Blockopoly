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
import InfoCard from "../components/InfoCard";
import ConsentModal from "../modal-pages/ConsentModal";
import CommitModal from "../modal-pages/CommitModal";
import WithdrawModal from "../modal-pages/WithdrawModal";

export default function SalePage() {
    const params = useParams<{id:string}>();
    const [sale, setSale] = useState<Sale | undefined>(undefined);
    const [user, setUser] = useState<string>("");
    const [escrowBalance, setEscrowBalance] = useState<bigint>(0n);
    const [escrowShares, setEscrowShares] = useState<bigint>(0n);

    const [consentPopup, setConsentPopup] = useState<boolean>(false);
    const [commitPopup, setCommitPopup] = useState<boolean>(false);
    const [withdrawPopup, setWithdrawPopup] = useState<boolean>(false);

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
        const walletContract = new ethers.Contract(DeployedAddresses["GeneralModule#Wallet"], WalletAbi.abi, provider);
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
            <ConsentModal trigger={consentPopup} close={setConsentPopup} sale={sale}/>
            <CommitModal trigger={commitPopup} close={setCommitPopup} sale={sale}/>
            <WithdrawModal trigger={withdrawPopup} close={setWithdrawPopup} sale={sale}/>
            <div className="page salePage" style={{ display: "flex"}}>
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
                    <div className="actionbar">
                        <h3>Assets Hold In Escrow</h3>
                        <p>Balance hold from buyer: {bigIntToFloatString(escrowBalance)}$</p>
                        <p>Shares hold from seller: {bigIntToFloatString(escrowShares)}%</p>
                        <button onClick={() => setConsentPopup(true)} disabled={sale.status != 0} className="pinkButton">Consent</button>
                        <button onClick={() => setCommitPopup(true)} disabled={sale.status != 1} className="pinkButton">Commit</button>
                        <button onClick={() => setWithdrawPopup(true)} disabled={sale.status != 1} className="redButton">Withdraw</button>
                    </div>
                }
            </div>
        </div>
    )
}



