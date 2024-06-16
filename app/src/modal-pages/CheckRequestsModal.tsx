import Popup from "../components/Popup";
import RequestsList from "../components/RequestsList";


export default function CheckRequestsModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {
    return (
        <Popup trigger={trigger} close={close}>
            <RequestsList of={address}/>
        </Popup>
    ) ;
}