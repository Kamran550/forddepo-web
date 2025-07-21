import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import cls from "./profile.module.scss";
import PencilLineIcon from "remixicon-react/PencilLineIcon";
import {
  Grid,
  useMediaQuery,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import DarkButton from "components/button/darkButton";
import SelectInput from "components/inputs/selectInput";
import dynamic from "next/dynamic";
import { IUser } from "interfaces/user.interface";
import useModal from "hooks/useModal";
import { useMutation } from "react-query";
import galleryService from "services/gallery";
import getAvatar from "utils/getAvatar";
import Loading from "components/loader/loading";
import profileService from "services/profile";
import { error, success } from "components/alert/toast";
import Datepicker from "components/inputs/datepicker";
import dayjs from "dayjs";
import { useAuth } from "contexts/auth/auth.context";
import FallbackImage from "components/fallbackImage/fallbackImage";
import PhoneInputWithVerification from "components/inputs/phoneInputWithVerification";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const ProfilePassword = dynamic(
  () => import("components/profilePassword/profilePassword"),
);

type Props = {
  data: IUser;
};

interface formValues {
  firstname?: string;
  lastname?: string;
  gender?: string;
  birthday?: string;
  img?: string;
  email?: string;
  phone?: string;
  referral?: string;
}

const genders = [
  { label: "male", value: "male" },
  { label: "female", value: "female" },
];

export default function ProfileContainer({ data }: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [passwordModal, handleOpen, handleClose] = useModal();
  const { setUserData } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen2 = () => setOpen(true);
  const handleClose2 = () => setOpen(false);

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "false";

  const { mutate: upload, isLoading: isUploading } = useMutation({
    mutationFn: (data: any) => galleryService.upload(data),
    onSuccess: (data) => {
      formik.setFieldValue("img", data.data.title);
    },
  });

  const { mutate: updateProfile, isLoading } = useMutation({
    mutationFn: (data: any) => profileService.update(data),
    onSuccess: (data) => {
      setUserData(data.data);
      success(t("saved"));
    },

    onError: (err: any) => {
      const data = err?.data;
      console.log({ data });

      if (data?.params && typeof data.params === "object") {
        Object.values(data.params)
          .flat()
          .forEach((msg) => {
            if (msg) error(t(msg));
          });
      } else if (data?.message) {
        error(t(data.message));
      } else {
        error(t("Something went wrong"));
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      gender: "",
      ...data,
      birthday: data?.birthday
        ? dayjs(data.birthday).format("YYYY-MM-DD")
        : undefined,
    },
    onSubmit: (values: formValues) => {
      const body = {
        firstname: values.firstname,
        email: values.email,
        lastname: values.lastname,
        birthday: values.birthday,
        gender: values.gender,
        images: values.img ? [values.img] : undefined,
        referral: values.referral,
        phone: isUsingCustomPhoneSignIn ? values.phone : undefined,
      };
      console.log({ body });

      updateProfile(body);
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      // if (!values.firstname) {
      //   errors.firstname = t("required");
      // }
      // if (!values.lastname) {
      //   errors.lastname = t("required");
      // }

      console.log("validate yoxlanilir");

      if (!values.firstname || values.firstname.trim() === "") {
        console.log("1");

        errors.firstname = t("required");
      }

      if (!values.lastname || values.lastname.trim() === "") {
        console.log("2");

        errors.lastname = t("required");
      }

      if (!values.email || values.email.trim() === "") {
        console.log("3");

        errors.email = t("required");
      }

      console.log("iflere gormedi", errors);

      return errors;
    },
  });

  function uploadImg(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.item(0);
    if (file && file?.size / 1024 / 1024 > 2) {
      error(t("image.size.should.be.less.than.2mb"));
      return;
    }
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "users");
      upload(formData);
    }
  }

  return (
    <div className={cls.root}>
      <div className={`container ${cls.container}`}>
        <div className={cls.header}>
          <h1 className={cls.title}>{t("profile")}</h1>
        </div>
        <form onSubmit={formik.handleSubmit}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Grid container spacing={isDesktop ? 6 : 4}>
                <Grid item xs={12}>
                  <div className={cls.avatar}>
                    <div className={cls.avatarWrapper}>
                      {!isUploading ? (
                        <FallbackImage
                          fill
                          src={getAvatar(formik.values.img)}
                          alt="Avatar"
                          sizes="100px"
                        />
                      ) : (
                        <Loading />
                      )}
                    </div>
                    <label htmlFor="img" className={cls.uploadBtn}>
                      <PencilLineIcon />
                    </label>
                    <input
                      type="file"
                      id="img"
                      name="img"
                      accept=".png, .jpg, .jpeg, .svg"
                      hidden
                      onChange={uploadImg}
                    />
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    name="firstname"
                    label={t("firstname")}
                    placeholder={t("type.here")}
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    error={!!formik.errors.firstname}
                    helperText={formik.errors.firstname}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    name="lastname"
                    label={t("lastname")}
                    placeholder={t("type.here")}
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    error={!!formik.errors.lastname}
                    helperText={formik.errors.lastname}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <div style={{ position: "relative", marginBottom: "2rem" }}>
                    {/* TextInput - normal input kimi */}
                    <TextInput
                      name="referral"
                      label={t("referral")}
                      placeholder={t("type.here")}
                      value={formik.values.referral}
                      onChange={formik.handleChange}
                      error={!!formik.errors.referral}
                      helperText={formik.errors.referral}
                      autoComplete="off"
                    />

                    {/* Info düyməsi */}
                    <div
                      className={cls.infoBtn}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                        color: "#888",
                      }}
                      onClick={handleOpen2}
                      title="Referal kod nədir?"
                    >
                      <InfoIcon fontSize="small" />
                    </div>

                    {/* Modal (Dialog) */}
                    <Dialog
                      open={open}
                      onClose={handleClose2}
                      PaperProps={{
                        className: cls.referalDialog,
                        sx: {
                          borderRadius: 3,
                          padding: 2,
                          minWidth: 300,
                          boxShadow: 6,
                        },
                      }}
                    >
                      <DialogTitle
                        sx={{ fontWeight: 600, fontSize: "1.25rem" }}
                      >
                        {t("referral-info.title")}
                      </DialogTitle>

                      <DialogContent dividers>
                        <Typography variant="body1" gutterBottom>
                          {t("referral.description")}.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          📌 <strong>{t("referral.example_label")}:</strong>
                          <br />
                          {t("referral.example_text")}
                          <br />
                          <br />
                          {t("referral.optional_note")}
                        </Typography>
                      </DialogContent>

                      <DialogActions>
                        <Button
                          onClick={handleClose2}
                          variant="contained"
                          size="small"
                        >
                          {t("referral.ok_button")}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>{" "}
                </Grid>
                <Grid item xs={12} md={6}>
                  <SelectInput
                    name="gender"
                    label={t("gender")}
                    placeholder={t("type.here")}
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    options={genders}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Datepicker
                    name="birthday"
                    label={t("date.of.birth")}
                    placeholder={t("type.here")}
                    value={formik.values.birthday}
                    onChange={formik.handleChange}
                    inputProps={{
                      max: dayjs().add(-18, "years").format("YYYY-MM-DD"),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    name="email"
                    label={t("email")}
                    placeholder={t("type.here")}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={!!formik.errors.email}
                    helperText={formik.errors.email}
                    // disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* <PhoneInput
                    className={cls.phoneInputCustom}
                    name="phone"
                    international
                    defaultCountry="AZ"
                    value={formik.values.phone}
                    onChange={(value) => formik.setFieldValue("phone", value)}
                  /> */}

                  <PhoneInputWithVerification
                    name="phone"
                    label={t("phone")}
                    placeholder={t("type.here")}
                    value={formik.values.phone}
                    onChange={
                      isUsingCustomPhoneSignIn ? formik.handleChange : undefined
                    }
                    disabled={!isUsingCustomPhoneSignIn}
                  />
                </Grid>
                <Grid item xs={12} md={6} mt={2}>
                  <PrimaryButton type="submit" loading={isLoading}>
                    {t("save")}
                  </PrimaryButton>
                </Grid>
                <Grid item xs={12} md={6} mt={isDesktop ? 2 : -2}>
                  <DarkButton type="button" onClick={handleOpen}>
                    {t("update.password")}
                  </DarkButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </div>
      {isDesktop ? (
        <ModalContainer open={passwordModal} onClose={handleClose}>
          <ProfilePassword handleClose={handleClose} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={passwordModal} onClose={handleClose}>
          <ProfilePassword handleClose={handleClose} />
        </MobileDrawer>
      )}
    </div>
  );
}
