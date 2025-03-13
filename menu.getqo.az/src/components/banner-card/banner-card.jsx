import { Link, useLocation } from "react-router-dom";
import cls from "./banner-card.module.css";
// import { LazyLoadImage } from "react-lazy-load-image-component";

export const BannerCard = ({ data, type }) => {
  const { search } = useLocation();
  return (
    <Link
      to={{ pathname: `/${type}/promotion/${data.id}`, search }}
      className={cls.banner}
    >
      <div className={cls.wrapper} style={{ backgroundImage: `url(${data.img})` }}>
        {/*<LazyLoadImage src={} alt={data.translation?.title} />*/}
        <div className={cls.caption}>
          <span className={cls.text}>{data.translation?.button_text}</span>
        </div>
        <div className={cls.content}>
          <h3 className={cls.title}>{data.translation?.title}</h3>
          <p className={cls.text}>{data.translation?.description}</p>
        </div>
      </div>
    </Link>
  );
};
