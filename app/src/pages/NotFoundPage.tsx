import { Link } from "react-router-dom"

export default function NotFoundPage() {
    return (
        <div className="page notFoundPage">
            <h3>404 Not Found</h3>
            <Link to="/">Go to Home</Link>
        </div>
    )
}