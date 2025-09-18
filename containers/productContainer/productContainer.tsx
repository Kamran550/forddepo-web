import React from "react";
import { useAuth } from "contexts/auth/auth.context";
import { Product } from "interfaces";
import ProtectedProductSingle from "components/productSingle/protectedProductSingle";
import ProductSingle from "components/productSingle/productSingle";
import MemberProductSingle from "components/productSingle/memberProductSingle";
import { useShop } from "contexts/shop/shop.context";

type Props = {
  handleClose: () => void;
  data?: Partial<Product>;
  uuid: string;
};

export default function ProductContainer({ data, uuid, handleClose }: Props) {
  const { isAuthenticated } = useAuth();
  const { isMember } = useShop();

  if (isMember) {
    console.log("if1");

    return <MemberProductSingle handleClose={handleClose} uuid={uuid} />;
  } else if (isAuthenticated) {
    console.log("if2");

    return <ProtectedProductSingle handleClose={handleClose} uuid={uuid} />;
  } else {
    console.log("if3");

    return <ProductSingle handleClose={handleClose} uuid={uuid} />;
  }
}
