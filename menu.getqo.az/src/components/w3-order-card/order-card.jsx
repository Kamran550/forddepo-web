import classes from "./order-card.module.css";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { formatPrice } from "../../utils/format-price";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import ConfirmButton from "../confirm-button/confirm-button.jsx";
import Box from "@mui/material/Box";

export const W3OrderCard = ({ data, deleteFunc }) => {
  const extras = data?.stock?.singleStockExtras;

  return (
    <div className={classes.card}>
      <div className={classes.cardMain}>
        <Typography variant="subtitle2" fontWeight={500}>
          {data.translation?.title}{" "}
          {extras?.map((item) => `(${item?.value})`).join(", ")}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          width="40%"
          justifyContent="space-between"
        >
          <Typography variant="caption" color="gray">
            {data.stock.amount}x
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              {formatPrice(data.stock?.total_price)}
            </Typography>
            {deleteFunc && (
              <ConfirmButton
                content={{ title: "Are you sure to delete this product?" }}
                onConfirm={deleteFunc}
              >
                <IconButton aria-label="delete">
                  <CancelIcon />
                </IconButton>
              </ConfirmButton>
            )}
          </Box>
        </Stack>
      </div>
      <Stack>
        {data?.addons?.map((addon) => (
          <Typography key={addon.id} variant="caption" color="gray">
            {addon.translation?.title || addon.stock.product.translation?.title}{" "}
            {`(${formatPrice(addon?.stock?.price)})`}x {addon.quantity}
          </Typography>
        ))}
      </Stack>
    </div>
  );
};
