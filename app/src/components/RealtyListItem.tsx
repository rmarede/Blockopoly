import { Realty } from "../api/api";
import { Link } from "react-router-dom";

export const RealtyListItem = ({realty}: {realty: Realty}) => {

  return (
    <Link to={`/realties/${realty.ownership}`} style={{ textDecoration: 'none'}}>
        <div className="realtyItem" style={{backgroundImage: `url("${realty.image}")`}}>
            <div className="realtyInfo">
                <h3>{realty.name}</h3>
                <p>{realty.location}</p>
            </div>
        </div>
    </Link>
  );
};
