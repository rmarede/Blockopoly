import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Rental, createRental } from "../api/api";
import { ethers } from "ethers";
import RentalFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RentalAgreementFactory.sol/RentalAgreementFactory.json"
import RentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { Link } from "react-router-dom";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function RentalsPage() {

    const [rentals, setRentals] = useState<Rental[]>([]);

    const fetchRentals = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const rentalFactoryContract = new ethers.Contract(DeployedAddresses["FactoryModule#RentalAgreementFactory"], RentalFactoryAbi.abi, provider);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const res = await rentalFactoryContract.getRentalsOf(signerAddress);
        const fetchedRentals: Rental[] = [];
        for (const r of res) {
            const rentalContract = new ethers.Contract(r, RentalAgreementAbi.abi, provider);
            const rentalTerms = await rentalContract.terms();
            const rental : Rental = createRental(rentalTerms, r);
            fetchedRentals.push(rental);
        }
        setRentals(fetchedRentals);
    }

    useEffect(() => {
        fetchRentals();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div className="rentalsPage">
                <h1>My Rentals</h1>
                <table >
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Asset</th>
                            <th>Rent Value</th>
                            <th>Status</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.map((item) => (
                            <tr key={item.address}>
                                <td>{item.address}</td>
                                <td>{item.realty}</td>
                                <td>{item.rentValue}</td>
                                <td>Pending</td>
                                <td><Link to={`/rentals/${item.address}`} style={{padding:"10px"}}><KeyboardArrowRightIcon/></Link></td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
            </div>
        </div>
    )
}