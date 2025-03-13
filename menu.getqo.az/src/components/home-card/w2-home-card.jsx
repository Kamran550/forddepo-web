import { Link, useLocation } from "react-router-dom";
import classes from "./home-card.module.css";

export const W2HomeCard = ({ title, path, image, type }) => {
  const location = useLocation();
  return (
    <div className={classes.w2card}>
      <Link
        to={{ pathname: `/${type}${path}`, search: location.search }}
        className={classes.w2link}
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className={classes.title}>{title}</div>
      </Link>
    </div>
  );
};
