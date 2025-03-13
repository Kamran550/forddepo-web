import LoadingIcon from "../../assets/icons/loading";
import { useElementOnScreen } from "../../hooks/use-element-on-screen";
import classes from './loader.module.css'

export const InfiniteLoader = ({
  hasMore,
  loadMore,
  loading,
  children,
}) => {
  const targetRef = useElementOnScreen({
    enabled: !!hasMore,
    onScreen: () => {
      loadMore();
    },
    rootMargin: "50%",
    threshold: 0.2,
  });

  return (
    <>
      {children}
      {loading && (
        <div className={classes.loading}>
          <LoadingIcon />
        </div>
      )}
      <span
        aria-label="bottom"
        ref={targetRef}
        style={{ visibility: "hidden" }}
      />
    </>
  );
};

InfiniteLoader.defaultProps = {
  loading: false,
};
