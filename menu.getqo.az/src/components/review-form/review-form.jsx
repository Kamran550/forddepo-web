import { Controller, useForm } from "react-hook-form";
import Stack from "@mui/material/Stack";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { TextInput } from "../w2-input";
import StarFill from "../../assets/icons/star-fill";
import StarEmpty from "../../assets/icons/star-empty";
import { W2Button } from "../w2-button";
import classes from "./review-form.module.css";
import Plate from "../../assets/icons/plate";
import Ring from "../../assets/icons/ring";
import Music from "../../assets/icons/music";
import Atmosphere from "../../assets/icons/atmosphere";

const options = [
  { value: "food", icon: <Plate /> },
  { value: "service", icon: <Ring /> },
  { value: "music", icon: <Music /> },
  { value: "atmosphere", icon: <Atmosphere /> },
];

export const ReviewForm = ({ onSubmit, loading }) => {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: { rating: 5, options: [] },
  });

  const handleSelectOption = (option) => {
    const selectedOptions = watch(`options`);
    if (selectedOptions?.includes(option)) {
      setValue(
        `options`,
        selectedOptions?.filter((selectedButton) => selectedButton !== option)
      );
      return;
    }
    setValue(`options`, [option]);
    setValue('rating', 1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack px={2} gap="2rem" mb={4}>
        <Typography variant="h6" fontWeight={600}>
          Review
        </Typography>
        <Controller
          control={control}
          name="comment"
          rules={{ required: "required" }}
          render={({ field, formState: { errors } }) => (
            <TextInput
              {...field}
              label="Comment"
              size="small"
              helperText={errors.comment?.message}
              error={!!errors.comment?.type}
            />
          )}
        />
        <Controller
          control={control}
          name="rating"
          rules={{required: 'required'}}
          render={({ field }) => (
            <Rating
              value={field.value}
              onChange={(e, value) => field.onChange(value)}
              sx={{ justifyContent: "space-between", mb: 2 }}
              icon={<StarFill />}
              emptyIcon={<StarEmpty />}
            />
          )}
        />
        <Stack gap="4px">
          <Typography variant="subtitle2" fontWeight={600}>
            What did you like the most?
          </Typography>
          <Typography variant="caption" color="gray">
            You can select several items
          </Typography>

          <div className={classes.optionsWrapper}>
            {options.map((option) => (
              <button
                onClick={() => handleSelectOption(option.value)}
                className={`${classes.option} ${
                  watch("options").includes(option.value) &&
                  classes.optionActive
                }`}
                type="button"
                key={option.value}
              >
                {option.icon}
                <span>{option.value}</span>
              </button>
            ))}
          </div>
        </Stack>
      </Stack>
      <Box px={2} mb={2}>
        <W2Button type="submit" loading={loading}>
          Send
        </W2Button>
      </Box>
    </form>
  );
};
