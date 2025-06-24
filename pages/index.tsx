import FreeDeliveryModal from "components/freeDeliveryModal/freeDeliveryModal";
import { AnimatePresence } from "framer-motion";
import SEO from "components/seo";
import FooterMenu from "containers/footerMenu/footerMenu";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import informationService from "services/information";
import createSettings from "utils/createSettings";
import { closeFreeDeliveryModal } from "redux/slices/modal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "redux/store";

const uiTypes = {
  "1": dynamic(() => import("containers/homev1/homev1")),
  "4": dynamic(() => import("containers/homev4/homev4")),
  "2": dynamic(() => import("containers/homev2/homev2")),
  "3": dynamic(() => import("containers/homev3/homev3")),
};

type HomeProps = {
  uiType?: keyof typeof uiTypes;
};

export default function Home({ uiType = "1" }: HomeProps) {
  const dispatch = useDispatch();

  const showPopup = useSelector(
    (state: RootState) => state.modal.showFreeDeliveryModal,
  );
  const freeCount = useSelector((state: RootState) => state.modal.freeDelivery);

  const Ui = uiTypes[uiType];
  const Homev1 = uiTypes["1"];
  return (
    <>
      {/* <AnimatePresence>
        {showPopup && freeCount !== null && (
          <FreeDeliveryModal
            freeDelivery={freeCount}
            onClose={() => dispatch(closeFreeDeliveryModal())}
          />
        )}
      </AnimatePresence> */}

      <SEO />
      {!!Ui ? <Ui /> : <Homev1 />}
      <FooterMenu />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const settingsData = await informationService.getSettings();
  const obj = createSettings(settingsData?.data);

  return {
    props: {
      uiType: process.env.NEXT_PUBLIC_UI_TYPE || obj?.ui_type,
    },
  };
};
