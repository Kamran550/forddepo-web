import React from "react";
import { IShop, OrderFormValues, UserCart } from "interfaces";
import cls from "./checkoutProducts.module.scss";
import AddCircleLineIcon from "remixicon-react/AddCircleLineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectUserCart, clearUserCart } from "redux/slices/userCart";
import { clearCart } from "redux/slices/cart";
import Loading from "components/loader/loading";
import CheckoutProductItem from "components/checkoutProductItem/checkoutProductItem";
import { useRouter } from "next/router";
import { FormikProps } from "formik";
import { useAuth } from "contexts/auth/auth.context";
import { useMutation } from "react-query";
import cartService from "services/cart";

type Props = {
  data: IShop;
  loading?: boolean;
  formik: FormikProps<OrderFormValues>;
};

export default function CheckoutProducts({
  data,
  loading = false,
  formik,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const cart = useAppSelector(selectUserCart);

  // Clear cart mutation
  const { mutate: deleteCart, isLoading: isClearLoading } = useMutation({
    mutationFn: (data: any) => cartService.delete(data),
    onSuccess: () => {
      dispatch(clearUserCart());
      // Səbət təmizləndikdən sonra əvvəlki səhifəyə yönləndir
      router.back();
    },
  });

  const goToCart = () => {
    router.push(`/shop/${data.id}`);
  };

  const handleClearCart = () => {
    if (window.confirm(t("clear.cart.confirm") || "Səbəti təmizləmək istədiyinizə əminsiniz?")) {
      if (isAuthenticated) {
        // Authenticated user üçün API çağırışı
        const cartIds =
          cart?.user_carts?.map((item) => item.cart_id).filter(Boolean) ||
          [];
        if (cartIds.length > 0) {
          deleteCart({ ids: cartIds });
        } else {
          dispatch(clearUserCart());
          // Səbət təmizləndikdən sonra əvvəlki səhifəyə yönləndir
          router.back();
        }
      } else {
        // Guest user üçün local cart təmizlə
        dispatch(clearCart());
        // Səbət təmizləndikdən sonra əvvəlki səhifəyə yönləndir
        router.back();
      }
    }
  };

  return (
    <div className={cls.wrapper}>
      <div className={cls.main}>
        <div className={cls.header}>
          <h3 className={cls.title}>{data?.translation?.title}</h3>
          <div className={cls.actions}>
            <button
              type="button"
              className={cls.clearBtn}
              onClick={handleClearCart}
              disabled={isClearLoading}
            >
              <DeleteBinLineIcon />
              <span className={cls.text}>{t("clear.cart") || "Səbəti təmizlə"}</span>
            </button>
          </div>
        </div>
        <div className={cls.body}>
          {cart.user_carts.map((item: UserCart) => (
            <React.Fragment key={"user" + item.id}>
              <div className={cls.userCard}>
                {cart.user_carts.length > 1 && (
                  <h3 className={cls.title}>
                    {item.user_id === cart.owner_id
                      ? t("your.orders")
                      : item.name}
                  </h3>
                )}
                {item.cartDetails.map((el) => (
                  <CheckoutProductItem
                    key={"c" + el.id + "q" + el.quantity}
                    data={el}
                    disabled={item.user_id !== cart.owner_id}
                    formik={formik}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      {loading && <Loading />}
    </div>
  );
}
