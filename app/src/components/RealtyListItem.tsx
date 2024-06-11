import { Realty } from "../api/api";
import { Link } from "react-router-dom";

export const RealtyListItem = ({apartment}: {apartment: Realty}) => {

  return (
    <Link to={`/realties/${apartment.ownership}`} style={{ textDecoration: 'none'}}>
        <div className="realtyItem" style={{backgroundImage: `url("${apartment.image}")`}}>
            <div className="realtyInfo">
                <h3>{apartment.name}</h3>
                <p>{apartment.location}</p>
            </div>
        </div>
        
    </Link>
  );
};
