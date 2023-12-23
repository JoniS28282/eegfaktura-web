import {CSSProperties, FC} from "react";
import {IonCheckbox, IonItem} from "@ionic/react";

const CheckboxComponent: FC<{style?: CSSProperties, label: string, setChecked: (state: boolean) => void, checked:boolean, disabled?:boolean}> = ({style, label, setChecked, checked, ...rest})  => {
  return (
    <div className={"form-element"} style={style}>
      <IonItem lines="none">
        <IonCheckbox
          justify="start"
          labelPlacement="end"
          checked={checked}
          onIonChange={(e) => setChecked(e.detail.checked)}
          aria-label={label}
          {...rest}>
          {label}
        </IonCheckbox>
      </IonItem>
    </div>
  )
}

export default CheckboxComponent;