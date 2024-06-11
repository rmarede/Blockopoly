import { Realty } from "../api/api";
import { Link } from "react-router-dom";

export const RealtyListItem = ({apartment}: {apartment: Realty}) => {

  return (
    <Link to={`/realties/${apartment.ownership}`} style={{ textDecoration: 'none'}}>
        <div className="realtyItem" style={{backgroundImage: `url("https://www.intrepidtravel.com/adventures/wp-content/uploads/2017/08/china_shanghai_yuyuan-garden-city.jpg")`}}>
            <div className="realtyInfo">
                <h3>{apartment.name}</h3>
                <p>{apartment.location}</p>
            </div>
        </div>
        
    </Link>
  );
};
