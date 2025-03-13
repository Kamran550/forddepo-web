import cls from "./banner.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Skeleton, useMediaQuery } from "@mui/material";
import { BannerCard } from "../banner-card";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { useSearchParams } from "react-router-dom";

const bannerSettings = {
  spaceBetween: 10,
  preloadImages: false,
  className: "banner-swiper full-width",
  breakpoints: {
    1140: {
      slidesPerView: 2.5,
      spaceBetween: 10,
    },
    0: {
      slidesPerView: 1.5,
    },
  },
};

export const Banners = ({ type }) => {
  const [searchParams] = useSearchParams();
  const { data: banners, isLoading } = useQuery(["banners"], () =>
    fetcher(
      `v1/rest/banners/paginate?shop_ids[0]=${searchParams.get("shop_id")}`,
    ).then((res) => res.json()),
  );
  const isMobile = useMediaQuery("(max-width:576px)");

  return (
    <div className={`container ${cls.container}`}>
      <div className={cls.banner}>
        <div className={cls.bannerContainer}>
          {!isLoading ? (
            <Swiper {...bannerSettings} slidesPerView="auto">
              {banners?.data.map((item) => (
                <SwiperSlide key={item.id}>
                  <BannerCard type={type} data={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className={cls.shimmerContainer}>
              {Array.from(new Array(isMobile ? 1 : 3)).map((item, idx) => (
                <Skeleton
                  key={"banner" + idx}
                  variant="rectangular"
                  className={cls.shimmer}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
