import { Link, useLocation } from "react-router-dom";
import classes from "./home-card.module.css";

export const HomeCard = ({ title, path, onClick, image }) => {
  const location = useLocation();
  const Component = path ? Link : "button"
  return (
    <div className={classes.card}>
      <Component
        to={{ pathname: path, search: location.search }}
        className={classes.link}
        onClick={onClick}
        style={{backgroundImage: `url(${image})`}}
      >
        <div
          className={classes.title}
        >
          {title}
        </div>
      </Component>
    </div>
  );
};
