import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

export default function Loader({color} : {color:string}) {
    return (
        <div className="Loader">
            <ClimbingBoxLoader className="pinkLoader" color={color} />
            <p>Submitting transaction...</p>
        </div>
    )
}