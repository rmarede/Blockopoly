import Navbar from "../components/Navbar";
export default function HomePage() {
    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div>
                <h1>Welcome to Blockopoly!</h1>
                <p>Before proceeding, make sure you have done the following requirements:</p>
                <ul>
                    <li>Install <a href="https://metamask.io/">MetaMask</a> extension on your browser.</li>
                    <li>Connect MetaMask to the local Besu Network.</li>
                </ul>
            </div>
        </div>
    )
}