import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Sale } from "../api/api";
import { ethers } from "ethers";
import SaleFactoryAbi from "../../../besu/src/artifacts/contracts/factory/SaleAgreementFactory.sol/SaleAgreementFactory.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { Link } from "react-router-dom";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function MortgagesPage() {

    const [sales, setSales] = useState<Sale[]>([]);

    const fetchRealties = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const saleFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#SaleAgreementFactory"], SaleFactoryAbi.abi, provider);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const res1 = await saleFactoryContract.getSalesOf(signerAddress);
        console.log(res1);
        const res = [
            {id: "1", asset: "House", share: 0.5, price: 100000},
            {id: "2", asset: "Apartment", share: 0.5, price: 100000},
            {id: "3", asset: "House", share: 0.5, price: 100000},
            {id: "4", asset: "Apartment", share: 0.5, price: 100000},
            {id: "5", asset: "House", share: 0.5, price: 100000},
            {id: "6", asset: "Apartment", share: 0.5, price: 100000},
            {id: "7", asset: "House", share: 0.5, price: 100000},];
        setSales(res);
    }

    useEffect(() => {
        fetchRealties();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div className="mortgagesPage">
                <h1>My Mortgages</h1>
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
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.asset}</td>
                                <td>{item.share}</td>
                                <td>{item.price}</td>
                                <td>Pending</td>
                                <td><Link to={`/sales/${item.id}`} style={{padding:"10px"}}><KeyboardArrowRightIcon/></Link></td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
            </div>
        </div>
    )
}