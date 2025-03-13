import { useEffect, useState } from "react";
import cls from "./extrasForm.module.css";
import AddonsItem from "./addonsItem";

export default function AddonsForm({
  data = [],
  handleAddonClick,
  type = "v1",
}) {
  const [selectedValues, setSelectedValues] = useState([]);

  const handleChange = (item, count) => {
    const value = String(item.id);
    if (!count) {
      setSelectedValues((prev) => prev.filter((el) => el.id !== value));
    } else {
      const newValues = [...selectedValues];
      const idx = newValues.findIndex((el) => el.id == value);
      if (idx < 0) {
        newValues.push({
          id: value,
          quantity: count,
        });
      } else {
        newValues[idx].quantity = count;
      }
      setSelectedValues(newValues);
    }
  };

  useEffect(() => {
    let addons = [];

    selectedValues.forEach((item) => {
      const element = data.find((el) => String(el.id) == item.id);
      if (!element) {
        addons = [];
        return;
      }
      const addon = {
        ...element.product,
        stock: { ...element.product?.stock, quantity: item.quantity },
      };
      addons.push(addon);
    });

    handleAddonClick(addons);
  }, [selectedValues]);

  return (
    <div
      className={`${cls.extrasWrapper} ${cls[type]}`}
      style={{ display: data.length > 0 ? "block" : "none" }}
    >
      <h3 className={cls.extraTitle} style={{ marginBottom: "8px" }}>
        ingredients
      </h3>
      <div
        className={cls.extraGroup}
        style={{ gap: "10px", display: "flex", flexDirection: "column" }}
      >
        {data
          .filter((item) => {
            const inStock = item.product?.stock?.quantity > 0;
            return !!item.product && inStock;
          })
          .map((item) => (
            <AddonsItem
              key={item.id + "addon"}
              data={item}
              type={type}
              selectedValues={selectedValues}
              handleChange={handleChange}
            />
          ))}
      </div>
    </div>
  );
}
