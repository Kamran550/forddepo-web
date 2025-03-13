import { cloneElement, useState } from "react";

import { Modal } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WifiIcon from "@mui/icons-material/Wifi";
import IconButton from "@mui/material/IconButton";

import cls from "./wifi-info.module.css";
import { useSettings } from "../../context/settings/provider.jsx";
import Stack from "@mui/material/Stack";

export const WifiInfo = ({ trigger }) => {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const handleWifiOpen = () => setOpen(true);
  const handleWifiClose = () => setOpen(false);

  const wifiData = settings.wifi_data;

  if (!wifiData?.visible) return null;
  return (
    <>
      {trigger ? (
        cloneElement(trigger, { onClick: handleWifiOpen })
      ) : (
        <IconButton onClick={handleWifiOpen}>
          <WifiIcon style={{ color: "#333" }} />
        </IconButton>
      )}
      <Modal
        open={open}
        onClose={handleWifiClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={cls.container}>
          <Box className={cls.header}>
            <WifiIcon style={{ color: "#333" }} />
            Wifi info
          </Box>
          <Box className={cls.body}>
            <Stack direction="row" gap="1rem">
              <Typography fontSize="1.1rem" variant="p" fontWeight="700">
                Network:
              </Typography>
              <Typography fontSize="1.1rem" variant="p" fontWeight="500">
                {wifiData.wifi_name}
              </Typography>
            </Stack>
            <Stack direction="row" gap="1rem" marginTop=".5rem">
              <Typography fontSize="1.1rem" variant="p" fontWeight="700">
                Password:
              </Typography>
              <Typography fontSize="1.1rem" variant="p" fontWeight="500">
                {wifiData.wifi_password}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
