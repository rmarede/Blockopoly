import { Realty } from "../api/api";
import { Link } from "react-router-dom";

export const RealtyListItem = ({apartment}: {apartment: Realty}) => {

  return (
    <Link to={`/realties/${apartment.id}`} style={{ textDecoration: 'none'}}>
        <div className="realtyItem" style={{backgroundImage: `url("https://www.bhg.com/thmb/H9VV9JNnKl-H1faFXnPlQfNprYw=/1799x0/filters:no_upscale():strip_icc()/white-modern-house-curved-patio-archway-c0a4a3b3-aa51b24d14d0464ea15d36e05aa85ac9.jpg")`}}>
            <div className="realtyInfo">
                <h3>{apartment.name}</h3>
                <p>{apartment.location}</p>
            </div>
        </div>
        
    </Link>
  );
};
