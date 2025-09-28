import React, { useMemo } from "react";
import cls from "./wholesaleCart.module.scss";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "hooks/useRedux";
import { selectCart, clearCart } from "redux/slices/cart";
import { selectUserCart, clearUserCart } from "redux/slices/userCart";
import { useAuth } from "contexts/auth/auth.context";
import { useMutation } from "react-query";
import cartService from "services/cart";
import Price from "components/price/price";
import ShoppingCart2LineIcon from "remixicon-react/ShoppingCart2LineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import { useRouter } from "next/router";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WholesaleCart({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cart = useAppSelector(selectCart);
  const userCart = useAppSelector(selectUserCart);

  // Clear cart mutation
  const { mutate: deleteCart, isLoading: isClearLoading } = useMutation({
    mutationFn: (data: any) => cartService.delete(data),
    onSuccess: () => {
      dispatch(clearUserCart());
    },
  });

  const cartData = useMemo(() => {
    if (isAuthenticated) {
      const cartItems =
        userCart?.user_carts?.flatMap((item) => item.cartDetails) || [];
      return {
        items: cartItems,
        total: userCart?.total_price || 0,
        count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }
    return {
      items: cart,
      total: cart.reduce(
        (sum, item) => sum + (item.stock?.total_price || 0) * item.quantity,
        0,
      ),
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, userCart, isAuthenticated]);

  const handleClearCart = () => {
    if (window.confirm(t("clear.cart.confirm"))) {
      if (isAuthenticated) {
        // Authenticated user üçün API çağırışı
        const cartIds =
          userCart?.user_carts?.map((item) => item.cart_id).filter(Boolean) ||
          [];
        if (cartIds.length > 0) {
          deleteCart({ ids: cartIds });
        } else {
          dispatch(clearUserCart());
        }
      } else {
        // Guest user üçün local cart təmizlə
        dispatch(clearCart());
      }
    }
  };

  const handleCheckout = () => {
    onClose();
    // Wholesale shop ID 501 üçün restaurant checkout səhifəsinə yönləndir
    router.push(`/restaurant/501/checkout`);
  };

  if (!isOpen) return null;

  return (
    <div className={cls.overlay} onClick={onClose}>
      <div className={cls.container} onClick={(e) => e.stopPropagation()}>
        <div className={cls.header}>
          <div className={cls.title}>
            <ShoppingCart2LineIcon />
            <span>{t("cart")}</span>
            {cartData.count > 0 && (
              <span className={cls.badge}>{cartData.count}</span>
            )}
          </div>
          <button className={cls.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={cls.content}>
          {cartData.items.length === 0 ? (
            <div className={cls.emptyCart}>
              <ShoppingCart2LineIcon className={cls.emptyIcon} />
              <p>{t("cart.empty")}</p>
            </div>
          ) : (
            <>
              <div className={cls.items}>
                {cartData.items.slice(0, 3).map((item, index) => (
                  <div key={index} className={cls.item}>
                    <div className={cls.itemInfo}>
                      <span className={cls.itemName}>
                        {item.stock?.product?.translation?.title}
                      </span>
                      <span className={cls.itemQuantity}>{item.quantity}x</span>
                    </div>
                    <div className={cls.itemPrice}>
                      <Price number={item.stock?.total_price} />
                    </div>
                  </div>
                ))}
                {cartData.items.length > 3 && (
                  <div className={cls.moreItems}>
                    +{cartData.items.length - 3} {t("more.items")}
                  </div>
                )}
              </div>

              <div className={cls.summary}>
                <div className={cls.total}>
                  <span>{t("total")}:</span>
                  <span className={cls.totalPrice}>
                    <Price number={cartData.total} />
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {cartData.items.length > 0 && (
          <div className={cls.actions}>
            <button
              className={cls.clearBtn}
              onClick={handleClearCart}
              disabled={isClearLoading}
            >
              <DeleteBinLineIcon />
              {isClearLoading ? t("loading") : t("clear.cart")}
            </button>
            <button className={cls.checkoutBtn} onClick={handleCheckout}>
              <CheckLineIcon />
              {t("checkout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
