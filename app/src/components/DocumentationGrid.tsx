import { useEffect, useState } from "react";
import { ethers } from "ethers";
import RealtyFactoryAbi from "../../../besu/src/artifacts/contracts/factory/RealtyFactory.sol/RealtyFactory.json";
import ComplianceAbi from "../../../besu/src/artifacts/contracts/compliance/Compliance.sol/Compliance.json";
import DeployedAddresses from "../../../besu/src/ignition/deployments/chain-1337/deployed_addresses.json";
import { DocumentationGridItem } from "./DocumentationGridItem";

export default function DocumentationGrid({realty}: {realty: string}) {

    const [documentation, setDocumentation] = useState<string[]>([]);

    const fetchDocumentation = async () => {
        if (realty === "") return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const realtyFactoryContract = new ethers.Contract(DeployedAddresses["GeneralModule#RealtyFactory"], RealtyFactoryAbi.abi, provider);
        const kind = await realtyFactoryContract.kindOf(realty);
        const complianceContract = new ethers.Contract(DeployedAddresses["GeneralModule#Compliance"], ComplianceAbi.abi, provider);
        const res = await complianceContract.documentation(kind, "sale");
        setDocumentation(res);
    }

    useEffect(() => {
        fetchDocumentation();
    }, [realty]);

    return (
        <div>
            {documentation.length > 0 ? (
            <div className="documentationGrid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)"}}>
                {documentation.map((a, i) => (
                    <DocumentationGridItem key={i} docAddr={a} realtyAddr={realty}/>
                ))}
            </div>
        ) : (
            <p>No documentation required.</p>
        )}
        </div>
    );
}