import Navbar from "../components/Navbar";

export default function MortgagePage() {

    return (
        <div  style={{ display: "flex"}}>
            <Navbar/>
            <div className="page mortgagePage" style={{ display: "flex"}}>
                <h1>Mortgage Page</h1>
            </div>
        </div>
    )
}