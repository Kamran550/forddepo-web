import ChevronLeft from "../../assets/icons/chevron-left";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import classes from "./w2-header.module.css";
import PhoneOutlined from "../../assets/icons/phone-outlined";
import Magnifier from "../../assets/icons/magnifier";
import { useNavigate } from "react-router-dom";
import ProductSearchInput from "../product-search-input";
import { useSettings } from "../../context/settings/provider.jsx";
import { useLayoutEffect, useState } from "react";
import { WifiInfo } from "../wifi-info/index.js";

export const W2Header = ({ onSearchChange, paymentSplitted }) => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useLayoutEffect(() => {
    const currentUrl = new URL(window.location.href);
    const historyHasStripeCheckout =
      currentUrl.searchParams.get("redirect_from") === "stripe";
    if (historyHasStripeCheckout) {
      const uiType = currentUrl.pathname.includes("w3") ? "w3" : "w2";
      currentUrl.searchParams.delete("redirect_from");
      navigate(`/${uiType}` + currentUrl.search, { replace: true });
    }
  }, []);

  const shopPhone = settings?.shop_phone;

  return (
    <div className={classes.wrapper}>
      <Container maxWidth="sm" className={classes.container}>
        {isSearchOpen ? (
          <ProductSearchInput
            onChange={onSearchChange}
            handleClose={() => {
              onSearchChange("");
              setIsSearchOpen(false);
            }}
          />
        ) : (
          <>
            {!paymentSplitted ? (
              <button onClick={() => navigate(-1)} className={classes.button}>
                <ChevronLeft />
                Back
              </button>
            ) : (
              <div></div>
            )}
            <div className={classes.actions}>
              <WifiInfo />
              {shopPhone && (
                <a href={`tel:+${shopPhone}`}>
                  <IconButton>
                    <PhoneOutlined />
                  </IconButton>
                </a>
              )}

              {onSearchChange && ( // Check if setSearchTerm is passed that means it's a search page
                <IconButton
                  // onClick={() =>
                  //   navigate({ pathname: `/${type}/search`, search })
                  // }
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Magnifier />
                </IconButton>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default W2Header;
