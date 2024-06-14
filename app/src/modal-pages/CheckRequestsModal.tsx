import Popup from "../components/Popup";

export default function CheckRequestsModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {
    return (
        <Popup trigger={trigger} close={close}>
            <h2>Check Requests for {address}</h2>
            
        </Popup>
    ) ;
}