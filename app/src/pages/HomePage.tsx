import Navbar from "../components/Navbar";
export default function HomePage() {
    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div>
                <h1>Welcome to Blockopoly!</h1>
                <div style={{ display: "flex", justifyContent: "space-between"}}>
                    <div className="setupGuide">
                        <h2>Setup Guide</h2>
                        <p>Before proceeding, make sure you have done the following requirements:</p>
                        <ul>
                            <li>Boot the network and populate it using the scripts provided.</li>
                            <li>Install <a href="https://metamask.io/">MetaMask</a> extension on your browser.</li>
                            <li>Add your local Besu network to MetaMask:
                                <ul>
                                    <li>Go to the network selection dropdown, and click on "Add network".</li>
                                    <li>Find the "Add a network manually option on the bottom of the page".</li>
                                    <li>Enter the URL of your network - http://localhost:8500</li>
                                    <li>Enter the Chain ID - 1337</li>
                                    <li>Save and make it your active network.</li>
                                </ul>
                            </li>
                            <li>Add to Metamask all the required accounts for the demonstration:
                                <ul>
                                    <li>User1 - </li>
                                    <li>User2 - </li>
                                    <li>Land Register - </li>
                                    <li>Bank - </li>
                                </ul>
                            </li>
                            <li>You should be done!</li>
                        </ul>
                    </div>
                    <div className="usageGuide">
                        <h2>Usage Guide</h2>
                        <p>Blockopoly is a blockchain-based real estate platform that allows users to buy, sell, rent, and mortgage properties.</p>
                        <p>Start by ...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}