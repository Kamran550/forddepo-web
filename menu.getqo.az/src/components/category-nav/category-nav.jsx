import cls from "./category-nav.module.css";
import Skeleton from "@mui/material/Skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import IconButton from "@mui/material/IconButton";
import Filter from "../../assets/icons/filter";
import { useScrollspy } from "../../hooks/use-scroll-spy";
import { useEffect, useState } from "react";

export const CategoryNav = ({ categories = [], loading }) => {
  const ids = categories.map((item) => item.uuid);
  const [swiper, setSwiper] = useState(null);
  const { activeId, activeIndex } = useScrollspy(ids, 54);

  useEffect(() => {
    if (swiper) {
      swiper?.slideTo(activeIndex, 80);
    }
  }, [activeIndex, swiper]);

  return (
    <div className={cls.container}>
      <Swiper
        slidesPerView="auto"
        onSwiper={(sw) => setSwiper(sw)}
        spaceBetween={8}
      >
        {loading ? (
          <>
            <SwiperSlide className={cls.slide}>
              <Skeleton sx={{ ml: 2 }} width={160} height={40} />
            </SwiperSlide>{" "}
            <SwiperSlide className={cls.slide}>
              <Skeleton width={160} height={40} />
            </SwiperSlide>{" "}
            <SwiperSlide className={cls.slide}>
              <Skeleton width={160} height={40} />
            </SwiperSlide>
          </>
        ) : (
          <>
            <SwiperSlide className={cls.slide}>
              <IconButton sx={{ ml: 1 }}>
                <Filter />
              </IconButton>
            </SwiperSlide>
            <SwiperSlide className={cls.slide}>
              <div className={cls.navItem}>
                <a href={`#recommended`} className={`${cls.navLink}`}>
                  Recommended
                </a>
              </div>
            </SwiperSlide>
            {categories?.map((item) => (
              <SwiperSlide key={item.id} className={cls.slide}>
                <div className={cls.navItem}>
                  <a
                    href={`#${item.uuid}`}
                    className={`${cls.navLink} ${
                      activeId === item.uuid ? cls.active : ""
                    }`}
                  >
                    {item.translation?.title}
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </>
        )}
      </Swiper>
    </div>
  );
};
