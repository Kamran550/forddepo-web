import HashtagIcon from "remixicon-react/HashtagIcon";
import { Chip } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import Stack from "@mui/material/Stack";

export const TableName = () => {
  const [searchParams] = useSearchParams();

  if (!searchParams.get("name")) return null;

  return (
    <Stack padding="1rem">
      <Chip
        icon={<HashtagIcon />}
        label={searchParams.get("name")}
        variant="outlined"
      />
    </Stack>
  );
};
