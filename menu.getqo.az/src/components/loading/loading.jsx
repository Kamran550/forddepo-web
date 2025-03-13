import CircularProgress from "@mui/material/CircularProgress";
import cls from "./loading.module.css";

export const Loading = () => {
  return (
    <div className={cls.loading}>
      <CircularProgress />
    </div>
  );
};
