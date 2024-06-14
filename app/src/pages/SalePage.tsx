import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { Sale, createSale } from "../api/api";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import SaleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { bigIntToFloatString } from "../utils/unit-conversion";

export default function SalePage() {
    const params = useParams<{id:string}>();
    const [sale, setSale] = useState<Sale | undefined>(undefined);
    const [user, setUser] = useState<string>("");

    const fetchSale = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
        const saleContract = new ethers.Contract(params.id ?? "", SaleAgreementAbi.abi, provider);
        const saleDetails = await saleContract.details();
        setSale(createSale(saleDetails, params.id ?? ""));
    }

    useEffect(() => {
        fetchSale();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <div className="salePage" style={{ display: "flex"}}>
                <div>
                    <h1>Sale Agreement</h1>
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
                        <p>Review the sale agreement and sign it to proceed with the transaction</p>
                        <div className="saleButtons">
                            <button className="consentBtn">Consent</button>
                            <button className="commitBtn">Commit</button>
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