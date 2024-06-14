import Popup from "../components/Popup";

export default function CreateRentalModal({ trigger, close, address } : {trigger:boolean, close: (value: boolean) => void, address:string}) {
    return (
        <Popup trigger={trigger} close={close}>
            <h2>Create Rental for {address}</h2>
        </Popup>
    ) ;
}