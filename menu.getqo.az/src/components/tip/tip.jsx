import Typography from "@mui/material/Typography";
import classes from './tip.module.css'

function TipBox() {
  return (
    <div className={classes.wrapper}>
      <Typography px={2} mt={2} variant="h5">
        Would you like to leave a tip?
      </Typography>

    </div>
  );
}

export default TipBox;

// import classes from "./tip.module.css";
// import Container from "@mui/material/Container";
// import Typography from "@mui/material/Typography";
// import { Controller, useForm } from "react-hook-form";
// import PencilFillIcon from "remixicon-react/PencilFillIcon";
// import { formatPrice } from "../../utils/format-price.js";
// import FormControl from "@mui/material/FormControl";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Radio from "@mui/material/Radio";
// import { FormLabel } from "@mui/material";
// import RadioGroup from "@mui/material/RadioGroup";
//
// const tipPercents = ["10", "15", "20"];
//
// function TipBox({ order,  }) {
//   const { register, handleSubmit, watch, control } = useForm();
//
//   const onSubmit = (data) => {
//     console.log(data);
//   };
//
//   const paymentOptions = paymentMethods.map((method) => ({
//     value: method.tag,
//     label: method.tag,
//   }));
//
//   const tipType = watch("tipType");
//   console.log("tipType", tipType);
//   return (
//     <Container maxWidth="sm" className={classes.container}>
//       <Typography
//         px={2}
//         variant="subtitle1"
//         fontSize={18}
//         fontWeight={600}
//         mb={1.5}
//       >
//         Would you like to leave a tip?
//       </Typography>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className={classes.tipRadioBtnsWrapper}>
//           {tipPercents.map((percent) => (
//             <div className={classes.tipRadioBtnWrapper} key={percent}>
//               <label
//                 className={`${classes.tipRadioBtn} ${tipType === percent ? classes.activeTipRadioBtn : ""}`}
//                 htmlFor={`tipType-${percent}`}
//               >
//                 <span className={classes.tipPercent}>{percent}%</span>
//                 <span className={classes.tipAmount}>
//                   {formatPrice(
//                     Math.floor((order?.total_price / 100) * percent),
//                   )}
//                 </span>
//                 <input
//                   id={`tipType-${percent}`}
//                   type="radio"
//                   {...register("tipType")}
//                   value={percent}
//                 />
//               </label>
//             </div>
//           ))}
//           <div className={classes.tipRadioBtnWrapper}>
//             <label
//               className={`${classes.tipRadioBtn} ${tipType === "custom" ? classes.activeTipRadioBtn : ""}`}
//               htmlFor={`tipType-custom`}
//             >
//               <PencilFillIcon />
//               <span className={classes.tipAmount}>
//                 {tipPercents === "custom" ? "Custom" : "Custom"}
//               </span>
//               <input
//                 id={`tipType-custom`}
//                 type="radio"
//                 {...register("tipType")}
//                 value="custom"
//               />
//             </label>
//           </div>
//         </div>
//         <FormInputRadio
//           name="radioOption"
//           control={control}
//           label="Choose a payment method"
//           options={paymentOptions}
//         />
//       </form>
//     </Container>
//   );
// }
//
// export const FormInputRadio = ({ name, control, label, options }) => {
//   const generateRadioOptions = () =>
//     options.map((option) => (
//       <FormControlLabel
//         key={option.value}
//         value={option.value}
//         label={option.label}
//         control={<Radio />}
//         className={classes.radioOption}
//       />
//     ));
//
//   return (
//     <FormControl style={{ width: "100%" }} component="fieldset">
//       <FormLabel component="legend">{label}</FormLabel>
//       <Controller
//         name={name}
//         control={control}
//         defaultValue={options[0].value}
//         render={({ field: { onChange, value }, fieldState: { error } }) => (
//           <RadioGroup value={value} onChange={onChange}>
//             {generateRadioOptions()}
//           </RadioGroup>
//         )}
//       />
//     </FormControl>
//   );
// };
//
// export default TipBox;
