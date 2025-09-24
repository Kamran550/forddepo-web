import React, { useEffect, useMemo, useState } from "react";
import SEO from "components/seo";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import shopService from "services/shop";
import { useRouter } from "next/router";
import productService from "services/product";
import { CategoryWithProducts, Product } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { useTranslation } from "react-i18next";
import { clearProduct, selectProduct, setProduct } from "redux/slices/product";
import dynamic from "next/dynamic";
import { getCookie } from "utils/session";
import getImage from "utils/getImage";
import getLanguage from "utils/getLanguage";
import useDebounce from "hooks/useDebounce";
import { useAuth } from "contexts/auth/auth.context";
import { ShopProvider } from "contexts/shop/shop.provider";
import WholesaleHeader from "containers/wholesaleHeader/wholesaleHeader";
import WholesaleProductGrid from "containers/wholesaleProductGrid/wholesaleProductGrid";
import WholesaleCart from "containers/wholesaleCart/wholesaleCart";
import FooterMenu from "containers/footerMenu/footerMenu";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const WholesaleProductContainer = dynamic(
  () =>
    import("containers/wholesaleProductContainer/wholesaleProductContainer"),
);
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const PageLoading = dynamic(() => import("components/loader/pageLoading"));

// Wholesale müştərilər üçün sabit shop ID
const WHOLESALE_SHOP_ID = 501;

type Props = {
  memberState: any;
};

export default function WholesalePage({ memberState }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { replace, push, query } = useRouter();
  const currency = useAppSelector(selectCurrency);
  const productState = useAppSelector(selectProduct);
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const debounceSearchValue = useDebounce(searchValue, 500);

  // Wholesale müştəri yoxlanışı
  useEffect(() => {
    if (!user) {
      push("/");
      return;
    }
    if (user.role !== "wholesale_customer") {
      push("/");
      return;
    }

    // URL-ə shop_id parametrini əlavə et ki, ProductSingle komponentləri düzgün işləsin
    if (!query.id) {
      replace(
        {
          pathname: "/wholesale",
          query: { ...query, id: WHOLESALE_SHOP_ID },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [user, push, query, replace]);

  // Shop məlumatlarını əldə etmə
  const { data: shopData, error: shopError } = useQuery(
    ["wholesale-shop", WHOLESALE_SHOP_ID, locale],
    () => shopService.getById(WHOLESALE_SHOP_ID),
    { keepPreviousData: true },
  );

  // Məhsullar - Backend API aktiv
  const {
    data: products,
    isLoading,
    error: productsError,
  } = useQuery(
    ["wholesale-products", WHOLESALE_SHOP_ID, currency?.id, locale],
    () => {
      let params: Record<string, string | undefined | number | string[]> = {
        currency_id: currency?.id,
      };

      console.log("Wholesale products API çağırışı:", {
        shopId: WHOLESALE_SHOP_ID,
        params,
        url: `/rest/shops/${WHOLESALE_SHOP_ID}/products`,
      });

      return productService.getAllShopProducts(WHOLESALE_SHOP_ID, params);
    },
    {
      staleTime: 0,
      enabled: true, // Backend düzəldildi, API aktiv
      onError: (error) => {
        console.error("Wholesale products API xətası:", error);
      },
      onSuccess: (data) => {
        console.log("Wholesale products API nəticəsi:", data);
      },
    },
  );

  const extractedCategories = useMemo(
    () =>
      products?.data?.all?.map((item: any) => ({ ...item, products: [] })) ||
      [],
    [products?.data?.all],
  );

  // Məhsulları filtrləmə
  const filteredProducts = useMemo(() => {
    let allProducts: Product[] = [];

    // Bütün məhsulları topla
    products?.data?.all?.forEach((category: CategoryWithProducts) => {
      allProducts = allProducts.concat(category.products || []);
      // Alt kateqoriyaların məhsullarını da əlavə et
      category.children?.forEach((subCategory: CategoryWithProducts) => {
        allProducts = allProducts.concat(subCategory.products || []);
      });
    });

    // Debug: Bütün məhsulların OEM kodlarını göstər
    if (debounceSearchValue) {
      console.log(
        "All products with OEM codes:",
        allProducts
          .filter((p) => p.oem_code)
          .map((p) => ({
            title: p.translation?.title,
            oem_code: p.oem_code,
            oem_type: typeof p.oem_code,
            is_array: Array.isArray(p.oem_code),
          })),
      );
    }

    // Axtarışa görə filtrle
    if (debounceSearchValue) {
      allProducts = allProducts.filter((product) => {
        const title = product.translation?.title?.toLowerCase() || "";
        const sku = (product as any).sku?.toLowerCase() || "";

        // OEM kodunu düzgün şəkildə işlə
        let oemCode = "";
        console.log({ product });

        console.log("oemcode:", product.oem_code);

        if (product.oem_code) {
          if (Array.isArray(product.oem_code)) {
            oemCode = product.oem_code.join(" ").toLowerCase();
          } else {
            oemCode = String(product.oem_code).toLowerCase();
          }
        }

        const search = debounceSearchValue.toLowerCase();

        // Debug üçün konsola çıxış
        if (
          search &&
          (title.includes(search) ||
            sku.includes(search) ||
            oemCode.includes(search))
        ) {
          console.log("Found product:", {
            title: product.translation?.title,
            sku: (product as any).sku,
            oem_code: product.oem_code,
            search: search,
          });
        }

        return (
          title.includes(search) ||
          sku.includes(search) ||
          oemCode.includes(search)
        );
      });
    }

    // Kateqoriyaya görə filtrle
    if (selectedCategoryId) {
      allProducts = allProducts.filter((product) => {
        if (selectedSubCategoryId) {
          return product.category_id === selectedSubCategoryId;
        }
        // Əsas kateqoriya və ya onun alt kateqoriyaları
        const category = extractedCategories.find(
          (cat: any) => cat.id === selectedCategoryId,
        );
        const subCategoryIds =
          category?.children?.map((sub: any) => sub.id) || [];
        return (
          product.category_id === selectedCategoryId ||
          subCategoryIds.includes(product.category_id)
        );
      });
    }

    return allProducts;
  }, [
    products?.data?.all,
    debounceSearchValue,
    selectedCategoryId,
    selectedSubCategoryId,
    extractedCategories,
  ]);

  const handleCloseProduct = () => {
    dispatch(clearProduct());
  };

  const handleCategorySelect = (
    categoryId?: number,
    subCategoryId?: number,
  ) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(subCategoryId);
  };

  const handleProductClick = (product: Product) => {
    // ProductCard komponentindən gələn click artıq setProduct edir
    // Bu funksiya artıq lazım deyil, amma callback olaraq saxlayırıq
  };

  if (shopError) {
    console.log("error => ", shopError);
    replace("/");
    return <PageLoading />;
  }

  if (productsError) {
    console.error("Products API xətası:", productsError);
    // Backend xətası varsa, boş məhsul siyahısı ilə davam et
  }

  if (!user || user.role !== "wholesale_customer") {
    return <PageLoading />;
  }

  return (
    <ShopProvider memberState={memberState} data={shopData?.data}>
      <SEO
        title={`${t("wholesale")} - ${shopData?.data?.translation?.title || ""}`}
        description={shopData?.data?.translation?.description}
        image={getImage(shopData?.data?.logo_img)}
      />

      {/* Wholesale Header */}
      <WholesaleHeader
        shopData={shopData?.data}
        categories={extractedCategories}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCategorySelect={handleCategorySelect}
        selectedCategoryId={selectedCategoryId}
        selectedSubCategoryId={selectedSubCategoryId}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Products Grid */}
      <WholesaleProductGrid
        products={filteredProducts}
        loading={isLoading}
        onProductClick={handleProductClick}
      />

      {/* Səbət Modal */}
      <WholesaleCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Məhsul Detail Modal/Drawer */}
      <ModalContainer open={!!productState.isOpen} onClose={handleCloseProduct}>
        <WholesaleProductContainer
          handleClose={handleCloseProduct}
          data={productState.product}
          uuid={productState.uuid || ""}
        />
      </ModalContainer>

      <FooterMenu />
    </ShopProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient();
  let memberState = getCookie("member", ctx);
  const locale = getLanguage(ctx.req.cookies?.locale);

  // Wholesale shop məlumatlarını prefetch et
  await queryClient.prefetchQuery(
    ["wholesale-shop", WHOLESALE_SHOP_ID, locale],
    () => shopService.getById(WHOLESALE_SHOP_ID),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      memberState,
    },
  };
};
