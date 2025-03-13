import Link from "next/link";
import cls from "./recomended-card.module.css";
import ShopLogo from "components/shopLogo/shopLogo";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function ShopHeroCard({ data }) {
  return (
    <Link href={`/restaurant/${data.id}`} className={cls.wrapper}>
      <div className={cls.header}>
        <ShopLogo data={data} size="small" />
        <h4 className={cls.shopTitle}>{data.translation?.title}</h4>
      </div>
      <LazyLoadImage src={data.background_img} alt={data.translation?.title} />
      <div className={cls.badge}>
        <span className={cls.text}>
          Number of products{data.products_count || 0}
        </span>
      </div>
    </Link>
  );
}
