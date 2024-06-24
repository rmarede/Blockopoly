import { useParams } from "react-router-dom";
import InfoCard from "../components/InfoCard";
import Navbar from "../components/Navbar";
import { mortgageStatusColor, mortgageStatusName } from "../utils/status-converter";
import MortgageLoanAbi from "../../../besu/src/artifacts/contracts/MortgageLoan.sol/MortgageLoan.json";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Loan, createLoan } from "../api/api";
import { useEffect, useState } from "react";
import { bigIntToFloatString } from "../utils/unit-conversion";
import { ethers } from "ethers";

export default function RentalPage() {
    const params = useParams<{id:string}>();
    const [loan, setLoan] = useState<Loan>();
    const [user, setUser] = useState<string>("");

    const fetchMortgage = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
        const mortgageContract = new ethers.Contract(params.id ?? "", MortgageLoanAbi.abi, provider);
        const details = await mortgageContract.details();
        const status = Number(await mortgageContract.state());
        const paymentCounter = Number(await mortgageContract.paymentCounter());
        const res = createLoan(details, params.id ?? "", status, paymentCounter);
        setLoan(res);
    }

    useEffect(() => {
        fetchMortgage();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <div className="page mortgagePage" style={{ display: "flex"}}>
                <div>
                    <div style={{ display: "flex"}}>
                        <h1>Mortgage Loan</h1>
                        <h2 style={{ marginLeft: "10px", color: mortgageStatusColor(loan?.status ?? 4)}}>{mortgageStatusName(loan?.status ?? 4)}</h2>
                    </div>
                    <h2>{loan?.address}</h2>
                    <div className="mortgageInfo">
                        <InfoCard title="General Progress">
                            <p>Payment Progress: {loan?.paymentCounter}/{loan?.loanTerm.toString()}</p>
                            <p>Next payment due date: TODO</p>
                        </InfoCard>
                        <div className="txParties" style={{ display: "flex"}}>
                            <InfoCard title={loan?.lender === user ? "Lender (You)" : "Lender"}>
                                <p>{loan?.lender}</p>
                            </InfoCard>
                            <ArrowForwardIcon/>
                            <InfoCard title={loan?.borrower === user ? "Borrower (You)" : "Borrower"}>
                                <p>{loan?.borrower}</p>
                            </InfoCard>
                        </div>
                        <InfoCard title="Loan Terms">
                            <p>Principal: {bigIntToFloatString(loan?.principal ?? 0n)}$</p>
                            <p>Down Payment: {bigIntToFloatString(loan?.downPayment ?? 0n)}$</p>
                            <p>Interest Rate: {bigIntToFloatString(loan?.interestRate ?? 0n)}%</p>
                            <p>Start Date: {loan?.startDate.toString()}</p>
                            <p>Late Payment Fee: {bigIntToFloatString(loan?.latePaymentFee ?? 0n)}$</p>
                            <p>Default Deadline: {loan?.defaultDeadline.toString()} periods</p>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    )
}