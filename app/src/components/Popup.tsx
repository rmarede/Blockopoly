import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function Popup({ children, trigger, close } : {children: React.ReactNode, trigger:boolean, close: (value: boolean) => void}) {
    return (trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <button className="action-button" onClick={() => close(false)}><CloseRoundedIcon/></button>
                {children}
            </div>
        </div>
    ) : "";
}