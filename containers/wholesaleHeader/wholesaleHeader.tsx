import React, { useState, useEffect, useMemo } from "react";
import cls from "./wholesaleHeader.module.scss";
import { useTranslation } from "react-i18next";
import { CategoryWithProducts } from "interfaces";
import SearchLineIcon from "remixicon-react/SearchLineIcon";
import FilterLineIcon from "remixicon-react/FilterLineIcon";
import ShoppingCart2LineIcon from "remixicon-react/ShoppingCart2LineIcon";
import { useAppSelector } from "hooks/useRedux";
import { selectCart } from "redux/slices/cart";
import { selectUserCart } from "redux/slices/userCart";
import { useAuth } from "contexts/auth/auth.context";

type Props = {
  shopData?: any;
  categories: CategoryWithProducts[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId?: number, subCategoryId?: number) => void;
  selectedCategoryId?: number;
  selectedSubCategoryId?: number;
  onCartClick?: () => void;
};

export default function WholesaleHeader({
  shopData,
  categories,
  searchValue,
  onSearchChange,
  onCategorySelect,
  selectedCategoryId,
  selectedSubCategoryId,
  onCartClick,
}: Props) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const cart = useAppSelector(selectCart);
  const userCart = useAppSelector(selectUserCart);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const cartItemsCount = useMemo(() => {
    if (isAuthenticated) {
      return (
        userCart.cartProducts?.reduce(
          (total: any, item: { quantity: any; }) => total + item.quantity,
          0,
        ) || 0
      );
    }
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart, userCart, isAuthenticated]);

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );
  const subCategories = selectedCategory?.children || [];

  return (
    <div className={cls.container}>
      {/* Shop Info Section */}
      <div className={cls.shopInfo}>
        <div className={cls.shopLogo}>
          {shopData?.logo_img && (
            <img src={shopData.logo_img} alt={shopData?.translation?.title} />
          )}
        </div>
        <div className={cls.shopDetails}>
          <h1 className={cls.shopTitle}>
            {shopData?.translation?.title || t("wholesale.shop")}
          </h1>
          <p className={cls.shopDescription}>
            {shopData?.translation?.description || t("wholesale.description")}
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className={cls.searchSection}>
        <div
          className={`${cls.searchBox} ${isSearchFocused ? cls.focused : ""}`}
        >
          <SearchLineIcon className={cls.searchIcon} />
          <input
            type="text"
            placeholder={t("search.product.oem")}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cls.searchInput}
          />
          {searchValue && (
            <button
              className={cls.clearSearch}
              onClick={() => onSearchChange("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Cart Button */}
        <button className={cls.cartButton} onClick={onCartClick}>
          <ShoppingCart2LineIcon />
          {cartItemsCount > 0 && (
            <span className={cls.cartBadge}>{cartItemsCount}</span>
          )}
          <span className={cls.cartText}>{t("cart")}</span>
        </button>
      </div>

      {/* Categories Navigation */}
      <div className={cls.categoriesSection}>
        <div className={cls.mainCategories}>
          <button
            className={`${cls.categoryBtn} ${!selectedCategoryId ? cls.active : ""}`}
            onClick={() => onCategorySelect()}
          >
            {t("all.categories")}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${cls.categoryBtn} ${
                selectedCategoryId === category.id ? cls.active : ""
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              {category.translation?.title}
            </button>
          ))}
        </div>

        {/* Sub Categories */}
        {subCategories.length > 0 && (
          <div className={cls.subCategories}>
            <button
              className={`${cls.subCategoryBtn} ${!selectedSubCategoryId ? cls.active : ""}`}
              onClick={() => onCategorySelect(selectedCategoryId)}
            >
              {t("all.subcategories")}
            </button>
            {subCategories.map((subCategory) => (
              <button
                key={subCategory.id}
                className={`${cls.subCategoryBtn} ${
                  selectedSubCategoryId === subCategory.id ? cls.active : ""
                }`}
                onClick={() =>
                  onCategorySelect(selectedCategoryId, subCategory.id)
                }
              >
                {subCategory.translation?.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
