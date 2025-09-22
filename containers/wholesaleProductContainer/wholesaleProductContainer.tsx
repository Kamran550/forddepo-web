import React from "react";
import { useAuth } from "contexts/auth/auth.context";
import { Product } from "interfaces";
import ProtectedProductSingle from "components/productSingle/protectedProductSingle";
import ProductSingle from "components/productSingle/productSingle";

type Props = {
  handleClose: () => void;
  data?: Partial<Product>;
  uuid: string;
};

export default function WholesaleProductContainer({
  data,
  uuid,
  handleClose,
}: Props) {
  const { isAuthenticated } = useAuth();

  // Wholesale səhifəsində member system yoxdur, ona görə sadə yoxlama
  if (isAuthenticated) {
    return <ProtectedProductSingle handleClose={handleClose} uuid={uuid} />;
  } else {
    return <ProductSingle handleClose={handleClose} uuid={uuid} />;
  }
}
