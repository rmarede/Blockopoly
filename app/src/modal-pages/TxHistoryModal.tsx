import Popup from "../components/Popup";
import SaleList from "../components/SaleList";

export default function TxHistoryModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {
    return (
        <Popup trigger={trigger} close={close}>
            <SaleList of={address}/>
        </Popup>
    ) ;
}