import { useEffect, useState } from "react";
import { Sale, createSale } from "../api/api";
import { ethers } from "ethers";
import SaleFactoryAbi from "../../../besu/src/artifacts/contracts/factory/SaleAgreementFactory.sol/SaleAgreementFactory.json"
import SaleAgreementAbi from "../../../besu/src/artifacts/contracts/SaleAgreement.sol/SaleAgreement.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { Link } from "react-router-dom";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { bigIntToFloatString } from "../utils/unit-conversion";
import { saleStatusName } from "../utils/status-converter";

export default function SaleList({of}: {of: string}) {

    const [sales, setSales] = useState<Sale[]>([]);

    const fetchSales = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const saleFactoryContract = new ethers.Contract(DeployedAddresses["GeneralModule#SaleAgreementFactory"], SaleFactoryAbi.abi, provider);
        const res = await saleFactoryContract.getSalesOf(of);
        const fetchedSales: Sale[] = [];
        for (const r of res) {
            const saleContract = new ethers.Contract(r, SaleAgreementAbi.abi, provider);
            const saleDetails = await saleContract.details();
            const saleStatus = Number(await saleContract.status());
            const sale : Sale = createSale(saleDetails, r, saleStatus);
            fetchedSales.push(sale);
        }
        setSales(fetchedSales);
    }

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <table>
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
                        <td>{bigIntToFloatString(item.share)}%</td>
                        <td>{bigIntToFloatString(item.price)}$</td>
                        <td>{saleStatusName(item.status)}</td>
                        <td><Link to={`/sales/${item.address}`} style={{padding:"10px"}}><KeyboardArrowRightIcon/></Link></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}