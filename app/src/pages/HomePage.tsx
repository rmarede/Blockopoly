import Navbar from "../components/Navbar";
export default function HomePage() {
    return (
        <div style={{ display: "flex"}}>
            <Navbar />
            <div className="page">
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
                                    <li>Find the "Add a network manually" option on the bottom of the page.</li>
                                    <li>Enter the URL of your network - http://localhost:8500</li>
                                    <li>Enter the Chain ID - 1337</li>
                                    <li>Save and make it your active network.</li>
                                </ul>
                            </li>
                            <li>Add to Metamask all the required accounts for the demonstration:
                                <ul>
                                    <li>User1 - 0x5d13d769309b9ab2de1cf46b1cb1f76ddea3702d285eb7deb77de225ac118240</li>
                                    <li>User2 - 0x9d5876523ecdf5723f447f8049ff1492fdf83f1c0edd5770b4805fcfc67bd14d</li>
                                    <li>Land Register - 0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63</li>
                                    <li>Bank - 0x6c6fd860efa48e8f07e85482f06ddb6a989ac962dcb13f8d30fa85c104a0219b</li>
                                </ul>
                            </li>
                            <li>Don't forget to connect all the accounts to the application! A prompt should show up when the time comes.</li>
                            <li>You can now use the application and switch between accounts seemlessly with Metamask. Reload the window every time you switch accounts.</li>
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