import Popup from "../components/Popup";

export default function TransferModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {
    return (
        <Popup trigger={trigger} close={close}>
            <h2>Transfer {address}</h2>
        </Popup>
    ) ;
}