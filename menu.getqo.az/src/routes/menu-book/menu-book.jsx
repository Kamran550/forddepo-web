import { Container, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import HTMLFlipBook from "react-pageflip";
import { useSearchParams } from "react-router-dom";
import LoadingIcon from "../../assets/icons/loading";
import { BookCover } from "../../components/book-cover";
import { BookPage } from "../../components/book-page";
import { SHOP_ID } from "../../config/site-settings";
import { createChunk } from "../../utils/create-chunk";
import { fetcher } from "../../utils/fetcher";
import classes from "./menu-book.module.css";

const MenuBook = () => {
  const [searchParams] = useSearchParams();
  const { data, isLoading } = useQuery(["productlist"], () =>
    fetcher(`v1/rest/shops/${searchParams.get('shop_id') || SHOP_ID}/products`, { lang: "en" }).then((res) =>
      res.json()
    )
  );
  const productList = createChunk(data?.data?.all);
  if (isLoading) {
    return (
      <div className="loading">
        <LoadingIcon size={60} />
      </div>
    );
  }

  return (
    <Container>
      <HTMLFlipBook
        width={550}
        height={850}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        renderOnlyPageLengthChange={false}
        minHeight={400}
        disableFlipByClick
        maxHeight={1533}
        onInit={(e) => console.log(e)}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className={classes.book}>
        <BookCover>Book title</BookCover>
        <div>
          <Typography align="center" variant="h4" fontWeight={700} mb={2}>
            Restaurant menu
          </Typography>
          <Stack justifyContent="center" alignItems="center" gap={4}>
            {data?.data?.all.map((list) => (
              <Typography variant="subtitle1" key={list.id}>{list.translation?.title}</Typography>
            ))}
          </Stack>
        </div>
        {productList.map((list, i) => (
          <BookPage key={i} number={i} list={list} />
        ))}
        <BookCover>The end</BookCover>
      </HTMLFlipBook>
    </Container>
  );
};

export default MenuBook;
