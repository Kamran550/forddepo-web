import Search2LineIcon from "remixicon-react/Search2LineIcon";
import CloseCircleLineIcon from "remixicon-react/CloseCircleLineIcon";
import { useEffect, useRef, useState } from "react";
import classes from "./product-search-input.module.css";
import { useDebounce } from "../../hooks/use-debounce.js";

export default function ProductSearchInput({ defaultValue = "", handleClose, onChange }) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const inputRef = useRef(null);

  const debouncedValue = useDebounce(searchTerm);

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);



  return (
    <div className={`${classes.search} white-splash`}>
      <div className={classes.wrapper}>
        <label htmlFor="search">
          <Search2LineIcon />
        </label>
        <input
          type="text"
          id="search"
          ref={inputRef}
          placeholder={"Search"}
          autoComplete="off"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button className={classes.closeBtn} onClick={handleClose}>
          <CloseCircleLineIcon />
        </button>
      </div>
    </div>
  );
}
