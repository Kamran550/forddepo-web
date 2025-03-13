import { useState } from "react";
import cls from "./extrasForm.module.css";
import Radio from "@mui/material/Radio";
import { RadioInput } from "../radio-input";

export default function ExtrasForm({
  name,
  data,
  handleExtrasClick,
  selectedExtra,
  type = "v1",
}) {
  const [selectedValue, setSelectedValue] = useState(String(selectedExtra.id));

  const handleChange = (item) => {
    setSelectedValue(String(item.id));
    handleExtrasClick(item);
  };

  const controlProps = (item) => ({
    checked: selectedValue == String(item.id),
    onChange: () => handleChange(item),
    value: String(item.id),
    id: String(item.id),
    name,
    inputProps: { "aria-label": String(item.id) },
  });

  return (
    <div className={`${cls.extrasWrapper} ${cls[type]}`}>
      <h3 className={cls.extraTitle}>{name}</h3>
      <div className={cls.extraGroup}>
        {data.map((item) => (
          <div key={item.id} className={cls.radioGroup}>
            {type === "w2" ? (
              <RadioInput {...controlProps(item)} />
            ) : (
              <Radio {...controlProps(item)} />
            )}
            <label className={cls.label} htmlFor={String(item.id)}>
              <span className={cls.text}>{item.value}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
