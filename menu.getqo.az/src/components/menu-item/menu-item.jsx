import { Skeleton, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import classes from "./menu-item.module.css";

export const MenuItem = ({ category }) => {
  const location = useLocation();
  return (
    <div className={classes.card}>
      <Link
        to={{ pathname: `/menu/${category.id}`, search: location.search }}
        className={classes.link}
        style={{
          backgroundImage: category.img
            ? `url(${category.img})`
            : "url(https://dyj6gt4964deb.cloudfront.net/images/217460674308904.jpg)",
        }}
      >
        <Typography
          sx={{ position: "relative" }}
          variant="subtitle1"
          color="white"
          fontSize={28}
        >
          {category?.translation.title}
        </Typography>
      </Link>
    </div>
  );
};

const MenuItemLoading = () => (
  <div className={classes.card}>
    <Skeleton width="100%" height="100%" variant="rectangular" />
  </div>
);

MenuItem.Loading = MenuItemLoading;
