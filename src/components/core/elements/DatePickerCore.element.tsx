import React, {FC, FormEvent, forwardRef, HTMLProps, useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import {Noop} from "react-hook-form";
import {IonInput} from "@ionic/react";

import "./DatePickerCore.element.scss"
import {IonInputCustomEvent} from "@ionic/core/dist/types/components";
import {InputInputEventDetail} from "@ionic/core/dist/types/components/input/input-interface";
import moment from "moment/moment";

interface DatePickerCoreProps {
  initialValue: Date
  onChange: (name: string, value: any) => void
  name: string,
  label: string,
  placeholder?: string,
  rules?: object,
  disabled?: boolean,

}

const DatePickerCoreElement: FC<DatePickerCoreProps> = ({name, initialValue, onChange, label, placeholder}) => {

  const [currentDate, setCurrentDate] = useState<Date>(initialValue ? new Date(initialValue) : new Date())

  useEffect(() => {
    setCurrentDate(initialValue ? new Date(initialValue) : new Date())
  }, [initialValue]);

  const onUpdate = () => {
      setCurrentDate(currentDate)
      onChange(name, currentDate)
  }

  // // value: string, onIonInput1: (...event: any[]) => void
  // const Component = forwardRef<HTMLIonInputElement, {onBlur: Noop}>(function CustomInput(p, ref) {
  //   return (
  //       <IonInput
  //         {...p}
  //         style={{flexDirection: "row-reverse"}}
  //         label={label}
  //         placeholder={placeholder}
  //         fill="outline"
  //         labelPlacement={"floating"}
  //         ref={ref}
  //       />
  //   );
  // });


  const Component = forwardRef<HTMLIonInputElement, HTMLProps<HTMLIonInputElement>>(function CustomInput(p, ref) {
    const handleInput1 = (event: IonInputCustomEvent<InputInputEventDetail>) => {
      const date = event.detail.value
      const valid = !!date && date.match(/^\w*\s\d{1,2},\s\d{4}$/)
      if (valid && valid.length > 0) {
        const dateObj = moment(date, "MMMM D, YYYY")
        setCurrentDate(dateObj.toDate())
      }
    }

    return (
      <IonInput
        value={p.value ? p.value.toString() : undefined}
        onClick={p.onClick}
        onIonChange={(e) => {
          p.onChange && p.onChange(e as unknown as FormEvent<HTMLIonInputElement>)
        }}
        style={{flexDirection: "row-reverse"}}
        label={label}
        placeholder={placeholder + " z.B. April 2, 2024"}
        fill="outline"
        labelPlacement={"floating"}
        ref={ref}
      />
    );
  });

  return (
    <div className="form-element">
      <DatePicker
        // selectsRange={false}
        selected={currentDate}
        name={name}
        onChange={(update) => {
          update && setCurrentDate(update)
        }}
        customInput={<Component />}
        onCalendarClose={onUpdate}
        dateFormat="MMMM d, yyyy"
        portalId="root-portal"
      />
      {/*{error && <div className={"error-line"}>{error.message}</div>}*/}
    </div>
  )
}
export default DatePickerCoreElement;