import { Link, useMatch, useResolvedPath } from "react-router-dom";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import logo from '../assets/blockopoly.png'

export default function Navbar() {
    return (
        <div className="navbar" style={{display:"flex", flexDirection:"column"}}>
            <nav>
                <ul>
                    <li>
                        <NavbarItem to="/">
                            <HomeRoundedIcon />
                            Home
                        </NavbarItem>
                    </li>
                    <li>
                        <NavbarItem to="/realties">
                            <BusinessRoundedIcon />
                            Realties
                        </NavbarItem>
                    </li>
                    <li>
                        <NavbarItem to="/sales">
                            <RepeatRoundedIcon />
                            Sales
                        </NavbarItem>
                    </li>
                    <li>
                        <NavbarItem to="/rentals">
                            <ReceiptRoundedIcon />
                            Rentals
                        </NavbarItem>
                    </li>
                    <li>
                        <NavbarItem to="/mortgages">
                            <AccountBalanceRoundedIcon />
                            Mortgages
                        </NavbarItem>
                    </li>
                    <li>
                        <NavbarItem to="/wallet">
                            <PaidRoundedIcon />
                            Wallet
                        </NavbarItem>
                    </li>
                </ul>
            </nav>
            <img src={logo} alt="blockopoly_logo" />
        </div>
    )
}

function NavbarItem({ to,  children } : { to: string, children: React.ReactNode }) {
    const resolvedPath = useResolvedPath(to)
    let isActive = useMatch({path: resolvedPath.pathname, end: false})
    if (to === "/") {
        isActive = null;
    } 
    return (
        <Link className={isActive ? "navbar-item active" : "navbar-item" } to={to}>{children}</Link>
    )
}