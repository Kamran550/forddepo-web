import { useQuery } from "@tanstack/react-query";
import { BottomSheet } from "react-spring-bottom-sheet";
import { fetcher } from "../../utils/fetcher";
import { CircularProgress } from "@mui/material";
import classes from "./payment-select.module.css";
import { RadioInput } from "../radio-input";
import Typography from "@mui/material/Typography";

export const PaymentSelect = ({
  open,
  onSelect,
  selectedPayment,
  onDismiss,
}) => {
  const { data: payments, isLoading } = useQuery(["payments"], () =>
    fetcher(`v1/rest/payments`).then((res) => res.json())
  );
  const controlProps = (item) => ({
    checked: selectedPayment?.id == String(item.id),
    onChange: () => {
        onSelect(item)
        onDismiss()
    },
    value: String(item.id),
    id: String(item.id),
    name: "payment",
    inputProps: { "aria-label": String(item.id) },
  });
  return (
    <BottomSheet open={open} onDismiss={onDismiss}>
      {isLoading ? (
        <CircularProgress size="large" />
      ) : (
        <div className={classes.radioGroup}>
          <Typography variant="subtitle1" fontWeight={600}>
            Select a payment method
          </Typography>
          {payments?.data.map((payment) => payment.tag === 'wallet' ? null : (
            <div className={classes.radio} key={payment.id}>
              <RadioInput {...controlProps(payment)} />
              <label className={classes.label} htmlFor={String(payment.id)}>
                <span className={classes.text}>{payment.tag}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
};
