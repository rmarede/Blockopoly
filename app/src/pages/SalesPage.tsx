import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Sale, createSale } from "../api/api";
import { ethers } from "ethers";
import SaleFactoryAbi from "../../../besu/src/artifacts/contracts/factory/SaleAgreementFactory.sol/SaleAgreementFactory.json"
import SaleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { Link } from "react-router-dom";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function SalesPage() {

    const [sales, setSales] = useState<Sale[]>([]);

    const fetchSales = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const saleFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#SaleAgreementFactory"], SaleFactoryAbi.abi, provider);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const res = await saleFactoryContract.getSalesOf(signerAddress);
        const fetchedSales: Sale[] = [];
        for (const r of res) {
            const saleContract = new ethers.Contract(r, SaleAgreementAbi.abi, provider);
            const saleDetails = await saleContract.details();
            const sale : Sale = createSale(saleDetails, r);
            fetchedSales.push(sale);
        }
        setSales(fetchedSales);
    }

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div className="salesPage">
                <h1>My Sales</h1>
                <table >
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Asset</th>
                            <th>Share</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((item) => (
                            <tr key={item.address}>
                                <td>{item.address}</td>
                                <td>{item.realty}</td>
                                <td>{item.share.toString()}</td>
                                <td>{item.price.toString()}</td>
                                <td>Pending</td>
                                <td><Link to={`/sales/${item.address}`} style={{padding:"10px"}}><KeyboardArrowRightIcon/></Link></td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
            </div>
        </div>
    )
}