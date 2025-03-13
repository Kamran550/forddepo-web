import { Typography } from "@mui/material";
import React from "react";
import { MenuCard } from "../menu-card";
import classes from "./book-page.module.css";

export const BookPage = React.forwardRef((props, ref) => {
  return (
    <div className={classes.page} ref={ref}>
      <Typography mb={2} variant="h5" fontWeight={700}>{props?.list?.title}</Typography>
      <div className={classes.grid}>
        {props?.list?.chunk.map((product) => (
          <MenuCard key={product.id} product={product} />
        ))}
      </div>
      <span className={classes.number}>{props.number + 1}</span>
    </div>
  );
});

BookPage.displayName = "BookPage";
