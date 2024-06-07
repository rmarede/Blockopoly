import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar";

export default function PropertyPage() {
    const params = useParams<{id:string}>();
    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <h1>Property Page</h1>
            <p>Property ID: {params.id}</p>
        </div>
    )
}