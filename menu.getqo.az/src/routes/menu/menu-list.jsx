import Stack from "@mui/material/Stack";
import { MenuItem } from "../../components/menu-item";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/fetcher";
import { InfiniteLoader } from "../../components/infinite-loader";
import { extractData } from "../../utils/extract-data";
import { SHOP_ID } from "../../config/site-settings";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../../hooks/use-debounce";
import { TableName } from "../../components/table-name/index.js";

const Home = () => {
  const [searchParams] = useSearchParams();
  const debouncedSearch = useDebounce(searchParams.get("search"));

  const params = debouncedSearch
    ? {
        perPage: 15,
        lang: "en",
        search: debouncedSearch,
      }
    : {
        perPage: 15,
        lang: "en",
      };

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      ["menucategories", searchParams.get("shop_id"), debouncedSearch],
      ({ pageParam = 1 }) =>
        fetcher(
          `v1/rest/shops/${searchParams.get("shop_id") || SHOP_ID}/categories`,
          {
            ...params,
            page: pageParam,
          },
        ).then((res) => res.json()),
      {
        getNextPageParam: (lastPage) =>
          lastPage.links.next && lastPage.meta.current_page + 1,
      },
    );
  const categoryList = extractData(data?.pages);
  return (
    <>
      {/*<SearchField*/}
      {/*  variant="filled"*/}
      {/*  value={searchParams.get("search") || ""}*/}
      {/*  onChange={(e) =>*/}
      {/*    setSearchParams((oldParams) => {*/}
      {/*      oldParams.set("search", e.target.value);*/}
      {/*      return oldParams;*/}
      {/*    })*/}
      {/*  }*/}
      {/*  placeholder="Search"*/}
      {/*  InputProps={{*/}
      {/*    endAdornment: (*/}
      {/*      <IconButton>*/}
      {/*        <SearchIcon />*/}
      {/*      </IconButton>*/}
      {/*    ),*/}
      {/*  }}*/}
      {/*/>*/}
      <TableName />
      <InfiniteLoader
        hasMore={hasNextPage}
        loadMore={() => fetchNextPage()}
        loading={isFetchingNextPage}
      >
        <Stack my={4} gap={2}>
          {isLoading
            ? Array.from(Array(4).keys()).map((category) => (
                <MenuItem.Loading key={category} />
              ))
            : categoryList?.map((category) => (
                <MenuItem key={category.id} category={category} />
              ))}
        </Stack>
      </InfiniteLoader>
    </>
  );
};

export default Home;
