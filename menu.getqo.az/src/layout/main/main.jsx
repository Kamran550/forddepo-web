import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WifiIcon from "@mui/icons-material/Wifi";
import classes from "./main.module.css";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowLeftIcon from "../../assets/icons/arrow-left";
import Skeleton from "@mui/material/Skeleton";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { SHOP_ID } from "../../config/site-settings";
import { Chip } from "@mui/material";
import { WifiInfo } from "../../components/wifi-info/index.js";

export const MainLayout = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get("shop_id");
  const { pathname } = useLocation();
  const { data: shopDetail, isLoading } = useQuery(["shopDetail"], () =>
    fetcher(`v1/rest/shops/${shopId || SHOP_ID}`).then((res) => res.json()),
  );
  const navigate = useNavigate();

  return (
    <>
      <Container maxWidth="sm">
        <div className={classes.header}>
          {pathname !== "/" && (
            <IconButton
              onClick={() => navigate(-1)}
              size="large"
              color="white"
              className={classes.backButton}
            >
              <ArrowLeftIcon />
            </IconButton>
          )}
          {isLoading ? (
            <Skeleton variant="rectangular" animation="wave" height="100%" />
          ) : (
            <div className={classes.headerImg}>
              <LazyLoadImage
                src={shopDetail.data?.background_img}
                alt="background"
                effect="blur"
              />
            </div>
          )}
        </div>
        <div className={classes.content}>
          {isLoading ? (
            <div className={classes.info}>
              <Typography variant="h4">
                <Skeleton width="50%" />
              </Typography>
              <Stack>
                <Typography variant="subtitle2">
                  <Skeleton width="100%" />
                </Typography>
                <Typography variant="subtitle2">
                  <Skeleton width="30%" />
                </Typography>
              </Stack>
              <Stack direction="row" columnGap={2}>
                <Typography variant="h2">
                  <Skeleton width={100} />
                </Typography>
                <Typography variant="h2">
                  <Skeleton width={80} />
                </Typography>
              </Stack>
            </div>
          ) : (
            <div className={classes.info}>
              <Typography variant="h4">
                {shopDetail?.data?.translation?.title}
              </Typography>
              <Stack
                direction="row"
                columnGap={8}
                my={2}
                rowGap={1}
                flexWrap="wrap"
                justifyContent="start"
              >
                {shopDetail?.data?.translation?.address && (
                  <Chip
                    icon={<LocationOnIcon />}
                    label={shopDetail?.data?.translation?.address}
                  />
                )}
                <WifiInfo trigger={<Chip icon={<WifiIcon />} label="Wifi info"/>} />
                <Chip
                  icon={<PhoneInTalkIcon />}
                  label={shopDetail?.data?.phone}
                />
                {/*<Stack direction="row" columnGap={2}>*/}
                {/*  */}
                {/*</Stack>*/}
                {/*{settings?.wifi_data?.visible && (*/}
                {/*  <Stack*/}
                {/*    justifyContent="center"*/}
                {/*    padding="0 1rem"*/}
                {/*    direction="row"*/}
                {/*    columnGap={2}*/}
                {/*  >*/}
                {/*    <Chip*/}
                {/*      icon={<WifiIcon />}*/}
                {/*      label={settings?.wifi_data?.wifi_name}*/}
                {/*    />*/}
                {/*    <Chip*/}
                {/*      icon={<WifiPasswordIcon />}*/}
                {/*      label={settings?.wifi_data?.wifi_password}*/}
                {/*    />*/}
                {/*  </Stack>*/}
                {/*)}*/}
              </Stack>
              {/*<Stack direction="row" mb={2} columnGap={2}>*/}
              {/*  <Button variant="contained">Main menu</Button>*/}
              {/*  <Button variant="outlined">Drinks</Button>*/}
              {/*</Stack>*/}
            </div>
          )}

          <Outlet />
        </div>
      </Container>
    </>
  );
};
