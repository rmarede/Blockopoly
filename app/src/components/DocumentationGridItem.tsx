import { useEffect, useState } from "react";
import { Documentation, createDocumentation } from "../api/api";
import { ethers } from "ethers";
import DocumentAbi from "../../../besu/src/artifacts/contracts/interface/compliance/IDocument.sol/IDocument.json";
import TaskIcon from '@mui/icons-material/Task';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AddDocumentModal from "../modal-pages/AddDocumentModal";

export const DocumentationGridItem = ({docAddr, realtyAddr}: {docAddr: string, realtyAddr:string}) => {

    const [document, setDocument] = useState<Documentation>();
    const [addDocPopup, setAddDocPopup] = useState<boolean>(false);

    const fetchDocumentation = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const docContract = new ethers.Contract(docAddr, DocumentAbi.abi, provider);
        const name = await docContract.name();
        const exp = await docContract.expirationDate(realtyAddr);

        const doc = createDocumentation(name, docAddr, exp);
        setDocument(doc);
    }

    useEffect(() => {
        fetchDocumentation();
    }, []);

    return (
        <>
            <AddDocumentModal trigger={addDocPopup} close={setAddDocPopup} realtyAddr={realtyAddr}/>
            { document?.expirationDate > Math.floor(Date.now() / 1000) ? (
                <div className="documentationGridItem compliant">
                    <TaskIcon fontSize="large"/>
                    <h3>{document?.name}</h3>
                    <p>Status: Compliant</p>
                </div>
                ) : (
                <div className="documentationGridItem" onClick={() => setAddDocPopup(true)}>
                    <NoteAddIcon fontSize="large"/>
                    <h3>{document?.name}</h3>
                    <p>Status: Missing</p>
                </div>
            )}
        </>
    );
};
