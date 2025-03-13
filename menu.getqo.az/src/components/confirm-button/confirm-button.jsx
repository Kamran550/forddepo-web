import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import Button from "@mui/material/Button";
import { useState, cloneElement } from "react";

function ConfirmButton({ children, onConfirm, content = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const { title = "Are you sure?" } = content;

  const handleClose = () => setIsVisible(false);
  const handleOpen = () => setIsVisible(true);
  const handleConfirm = async () => {
    try {
      setIsLoadingBtn(true);
      await onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingBtn(false);
      setIsVisible(false);
    }
  };

  return (
    <>
      {cloneElement(children, { onClick: handleOpen })}
      <Dialog
        open={isVisible}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        {/*<DialogContent>*/}
        {/*  <DialogContentText id="alert-dialog-description">*/}
        {/*    Let Google help apps determine location. This means sending*/}
        {/*    anonymous location data to Google, even when no apps are running.*/}
        {/*  </DialogContentText>*/}
        {/*</DialogContent>*/}
        <DialogActions>
          <Button disabled={isLoadingBtn} onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={isLoadingBtn} onClick={handleConfirm} autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConfirmButton;
