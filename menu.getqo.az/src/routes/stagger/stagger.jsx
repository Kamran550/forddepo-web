import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { LazyLoadImage } from "react-lazy-load-image-component";
import LoadingIcon from "../../assets/icons/loading";
import { SHOP_ID } from "../../config/site-settings";
import { useCartContext } from "../../context/cart/provider";
import { fetcher } from "../../utils/fetcher";
import classes from "./stagger.module.css";
import { IconButton } from "@mui/material";
import MinusIcon from "../../assets/icons/minus";
import PlusIcon from "../../assets/icons/plus";
import { formatPrice } from "../../utils/format-price";
import { useSearchParams } from "react-router-dom";

const createCardFlipId = (product) => `listItem-${product?.id}`;

const shouldFlip = (product) => (prev, current) =>
  product?.id === prev || product?.id === current;

const ListItem = ({ product, onClick }) => {
  return (
    <Flipped
      flipId={createCardFlipId(product)}
      stagger="card"
      shouldInvert={shouldFlip(product)}
    >
      <div className="listItem" onClick={() => onClick(product)}>
        <Flipped inverseFlipId={createCardFlipId(product)}>
          <div className="listItemContent">
            <Flipped
              flipId={`avatar-${product?.id}`}
              stagger="card-content"
              shouldFlip={shouldFlip(product)}
              delayUntil={createCardFlipId(product)}
            >
              <div className="avatar">
                <LazyLoadImage
                  src={product?.img}
                  alt={product.translation?.title}
                  className={classes.image}
                />
              </div>
            </Flipped>
            <div className="description">
              <Flipped
                key={0}
                flipId={`description-${product?.id}-${0}`}
                stagger="card-content"
                shouldFlip={shouldFlip(product)}
                delayUntil={createCardFlipId(product)}
              >
                <Typography variant="subtitle1">
                  {product.translation?.title}
                </Typography>
              </Flipped>
              <div className="animated-out">
                <Typography
                  className="additional-content"
                  variant="h5"
                  color="primary"
                >
                  {formatPrice(product.stock?.total_price)}
                </Typography>
              </div>
            </div>
          </div>
        </Flipped>
      </div>
    </Flipped>
  );
};

const ExpandedListItem = ({ product, onClick }) => {
  const { addToCart, cart, removeItem, toggleAmount } = useCartContext();
  const InList = cart.find((item) => item.id === product.id);
  return (
    <Flipped
      flipId={createCardFlipId(product)}
      stagger="card"
      onStart={(el) => {
        setTimeout(() => {
          el.classList.add("animated-in");
        }, 400);
      }}
    >
      <div className="expandedListItem" onClick={() => onClick(product)}>
        <Flipped inverseFlipId={createCardFlipId(product)}>
          <div className="expandedListItemContent">
            <Flipped
              flipId={`avatar-${product.id}`}
              stagger="card-content"
              delayUntil={createCardFlipId(product)}
            >
              <div className="avatar avatarExpanded">
                <LazyLoadImage
                  src={product.img}
                  alt={product.translation?.title}
                  className="avatar avatarExpanded"
                />
              </div>
            </Flipped>
            <div className="description">
              <Typography
                className="additional-content"
                variant="h5"
                color="primary"
              >
                {formatPrice(product.stock?.total_price)}
              </Typography>
              <Flipped
                key={0}
                flipId={`description-${product.id}-${0}`}
                stagger="card-content"
                delayUntil={createCardFlipId(product)}
              >
                <Typography variant="h6">
                  {product.translation?.title}
                </Typography>
              </Flipped>
              <div className="additional-content">
                <Typography variant="subtitle2" color="gray">
                  {product.translation?.description}
                </Typography>
              </div>
            </div>
            <div className="additional-content">
              {InList ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      InList.amount <= product.min_qty
                        ? removeItem(product.id)
                        : toggleAmount(product.id, "dec");
                    }}
                    size="large"
                    color="primary"
                  >
                    <MinusIcon />
                  </IconButton>
                  <Typography color="primary" variant="h6">
                    {InList.amount}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAmount(product.id, "inc");
                    }}
                    color="primary"
                    size="large"
                  >
                    <PlusIcon />
                  </IconButton>
                </Stack>
              ) : (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  variant="contained"
                  fullWidth
                >
                  Add to cart
                </Button>
              )}
            </div>
          </div>
        </Flipped>
      </div>
    </Flipped>
  );
};

const Stagger = () => {
  const [searchParams] = useSearchParams();
  const [focused, setFocused] = useState(null);
  const onClick = (product) =>
    setFocused(focused?.id === product?.id ? null : product);
  const { data, isLoading } = useQuery(["productlist"], () =>
    fetcher(
      `v1/rest/shops/${searchParams.get("shop_id") || SHOP_ID}/products`,
      { lang: "en" }
    ).then((res) => res.json())
  );
  const productList = data?.data?.all.flatMap((list) => list.products);

  if (isLoading) {
    return (
      <div className="loading">
        <LoadingIcon size={60} />
      </div>
    );
  }

  return (
    <Container maxWidth="sm">
      <Flipper
        flipKey={focused?.id}
        className="staggered-list-content"
        spring="gentle"
        staggerConfig={{
          card: {
            reverse: focused !== null,
          },
        }}
        decisionData={focused?.id}
      >
        <ul className="list">
          {productList?.map((product) => {
            return (
              <li key={product.id}>
                {product.id === focused?.id ? (
                  <ExpandedListItem product={focused} onClick={onClick} />
                ) : (
                  <ListItem
                    product={product}
                    key={product.id}
                    onClick={onClick}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </Flipper>
    </Container>
  );
};

export default Stagger;
