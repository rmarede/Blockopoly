import { Link, useParams } from "react-router-dom";
import InfoCard from "../components/InfoCard";
import Navbar from "../components/Navbar";
import { rentalStatusColor, rentalStatusName } from "../utils/status-converter";
import RentalAgreementAbi from "../../../besu/src/artifacts/contracts/RentalAgreement.sol/RentalAgreement.json";
import OwnershipAbi from "../../../besu/src/artifacts/contracts/Ownership.sol/Ownership.json"
import { Rental, createRental } from "../api/api";
import { useEffect, useState } from "react";
import { bigIntToFloatString } from "../utils/unit-conversion";
import { ethers } from "ethers";
import CheckRequestsModal from "../modal-pages/CheckRequestsModal";
import RentalEnrollModal from "../modal-pages/RentalEnrollModal";
import PayRentModal from "../modal-pages/PayRentModal";
import RenewalModal from "../modal-pages/RenewalModal";
import ReturnSecurityModal from "../modal-pages/ReturnSecurityModal";
import EvictModal from "../modal-pages/EvictModal";
import EarlyTerminationModal from "../modal-pages/EarlyTerminationModal";

export default function RentalPage() {
    const params = useParams<{id:string}>();
    const [rental, setRental] = useState<Rental>();
    const [user, setUser] = useState<string>("");
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [numPayments, setNumPayments] = useState<number>(0);
    const [paymentDueDate, setPaymentDueDate] = useState<number>(0);

    const [requestsPopup, setRequestsPopup] = useState<boolean>(false);
    const [renewalPopup, setRenewalPopup] = useState<boolean>(false);
    const [evictPopup, setEvictPopup] = useState<boolean>(false);
    const [retSecurityPopup, setRetSecurityPopup] = useState<boolean>(false);
    const [earlyTermPopup, setEarlyTermPopup] = useState<boolean>(false);
    const [payPopup, setPayPopup] = useState<boolean>(false);
    const [enrollPopup, setEnrollPopup] = useState<boolean>(false);

    const fetchRental = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUser(signerAddress);
        const rentalContract = new ethers.Contract(params.id ?? "", RentalAgreementAbi.abi, provider);
        const terms = await rentalContract.terms();
        const tenant = await rentalContract.tenant();
        const status = Number(await rentalContract.status());
        setPaymentDueDate(Number(await rentalContract.paymentDueDate()));
        setNumPayments(Number(await rentalContract.paymentCounter()));
        const res = createRental(terms, params.id ?? "", tenant, status);
        setRental(res);
        const ownershipContract = new ethers.Contract(res.realty, OwnershipAbi.abi, provider);
        const shares = await ownershipContract.shareOf(signerAddress);
        setIsOwner(shares > 0);
    }

    useEffect(() => {
        fetchRental();
    }, []);

    return (
        <div style={{ display: "flex"}}>
            <Navbar/>
            <CheckRequestsModal trigger={requestsPopup} close={setRequestsPopup} address={rental?.address ?? ""}/>
            <RentalEnrollModal trigger={enrollPopup} close={setEnrollPopup} rental={rental}/>
            <PayRentModal trigger={payPopup} close={setPayPopup} rental={rental}/>
            <RenewalModal trigger={renewalPopup} close={setRenewalPopup} rental={rental}/>
            <EarlyTerminationModal trigger={earlyTermPopup} close={setEarlyTermPopup} rental={rental}/>
            <ReturnSecurityModal trigger={retSecurityPopup} close={setRetSecurityPopup} rental={rental}/>
            <EvictModal trigger={evictPopup} close={setEvictPopup} rental={rental}/>

            <div className="page rentalPage" style={{ display: "flex"}}>
                <div>
                    <div style={{ display: "flex"}}>
                        <h1>Rental Agreement</h1>
                        <h2 style={{ marginLeft: "10px", color: rentalStatusColor(rental?.status ?? 4)}}>{rentalStatusName(rental?.status ?? 4)}</h2>
                    </div>
                    <h2>{rental?.address}</h2>
                    <div className="rentalInfo">
                        <InfoCard title="General Progress">
                            <p>Payment Progress: {numPayments}/{rental?.duration.toString()}</p>
                            <p>Next payment due date: {paymentDueDate.toString()}</p>
                        </InfoCard>
                        <InfoCard title="Tenant">
                            <p>{rental?.tenant}</p>
                        </InfoCard>
                        <InfoCard title="Rental Terms">
                            <p>Realty: <Link to={`/realties/${rental?.realty}`}>{rental?.realty}</Link></p>
                            <p>Price: {bigIntToFloatString(rental?.rentValue ?? 0n)}$</p>
                            <p>Security Deposit: {bigIntToFloatString(rental?.securityDeposit ?? 0n)}$</p>
                            <p>Duration: {bigIntToFloatString(rental?.duration ?? 0n)} periods</p>
                            <p>Start Date: {bigIntToFloatString(rental?.startDate ?? 0n)}</p>
                            <p>Payment Due Date: {rental?.paymentDueDate.toString()}th of each period</p>
                            <p>Late Payment Fee: {bigIntToFloatString(rental?.latePaymentFee ?? 0n)}$</p>
                            <p>Early Termination Fee: {bigIntToFloatString(rental?.earlyTerminationFee ?? 0n)}$</p>
                            <p>Early Termination Notice: {rental?.earlyTerminationNotice.toString()} days</p>
                            <p>Extra: {rental?.extra}</p>
                        </InfoCard>
                    </div>
                </div>
                {(isOwner || rental?.tenant === user) && (
                    <div className="actionbar">
                        {(rental?.tenant === user) && 
                            <>
                                <h3>Tenant Actions</h3>
                                <button onClick={() => setEnrollPopup(true)} disabled={rental?.status != 0} className="redButton">Enroll</button>
                                <button onClick={() => setPayPopup(true)} disabled={rental?.status != 1} className="yellowButton">Pay</button>
                                <button onClick={() => setEarlyTermPopup(true)} disabled={rental?.status != 1 && rental?.status != 2} className="blueButton">Anticipate Termination</button>
                                <button onClick={() => setRenewalPopup(true)} disabled={rental?.status != 1 && rental?.status != 2} className="blueButton">Request Renewal</button>
                            </>
                        }
                        <button onClick={() => setRequestsPopup(true)} disabled={rental?.status != 1 && rental?.status != 2} className="whiteButton">Check Requests</button>
                        {(isOwner) && (
                            <>
                                <h3>Owner Actions</h3>
                                <button onClick={() => setRetSecurityPopup(true)} disabled={rental?.status != 2} className="blueButton">Return Security Deposit</button>
                                <button onClick={() => setEvictPopup(true)} disabled={rental?.status != 1} className="redButton">Evict</button>
                            </>
                        )}     
                    </div>
                )}
            </div>
        </div>
    )
}