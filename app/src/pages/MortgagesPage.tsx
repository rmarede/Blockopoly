import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Loan, createLoan } from "../api/api";
import { ethers } from "ethers";
import MortgageFactoryAbi from "../../../besu/src/artifacts/contracts/factory/MortgageLoanFactory.sol/MortgageLoanFactory.json"
import MortgageLoanAbi from "../../../besu/src/artifacts/contracts/MortgageLoan.sol/MortgageLoan.json"
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json"
import { Link } from "react-router-dom";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { bigIntToFloatString } from "../utils/unit-conversion";

export default function MortgagesPage() {

    const [mortgages, setMortgages] = useState<Loan[]>([]);

    const fetchMortgages = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const mortgageFactoryContract = new ethers.Contract(DeployedAddresses["GeneralModule#MortgageLoanFactory"], MortgageFactoryAbi.abi, provider);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const res = await mortgageFactoryContract.getMortgagesOf(signerAddress);
        const fetchedMortgages: Loan[] = [];
        for (const r of res) {
            const loanContract = new ethers.Contract(r, MortgageLoanAbi.abi, provider);
            const loanDetails = await loanContract.details();
            const loan : Loan = createLoan(loanDetails, r);
            fetchedMortgages.push(loan);
        }
        setMortgages(fetchedMortgages);
    }

    useEffect(() => {
        fetchMortgages();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div className="page mortgagesPage">
                <h1>My Loans</h1>
                <table >
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Principal</th>
                            <th>Interest Rate</th>
                            <th>Status</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mortgages.map((item) => (
                            <tr key={item.address}>
                                <td>{item.address}</td>
                                <td>{bigIntToFloatString(item.principal)}$</td>
                                <td>{bigIntToFloatString(item.interestRate)}%</td>
                                <td>Pending</td>
                                <td><Link to={`/mortgages/${item.address}`} style={{padding:"10px"}}><KeyboardArrowRightIcon/></Link></td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
            </div>
        </div>
    )
}