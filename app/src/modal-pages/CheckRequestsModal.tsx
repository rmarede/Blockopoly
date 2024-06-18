import Popup from "../components/Popup";
import RequestsList from "../components/RequestsList";
import RequestsListRecursive from "../components/RequestsListRecursive";


export default function CheckRequestsModal({ trigger, close, address, recursive } : {trigger:boolean, close: (value: boolean) => void, address:string, recursive:boolean}) {
    return (
        <>
            {recursive ? 
                <Popup trigger={trigger} close={close}>
                    <RequestsList of={address}/>
                </Popup>
            : 
                <Popup trigger={trigger} close={close}>
                    <RequestsListRecursive of={address}/>
                </Popup>
            }
        </>
    ) ;
}