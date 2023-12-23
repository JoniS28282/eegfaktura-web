import React, {FC, useMemo, useState} from "react";
import {IonSelect, IonSelectOption, SelectCustomEvent} from "@ionic/react";
import {SelectedPeriod} from "../../models/energy.model";
import {MONTHNAME} from "../../models/eeg.model";
import {getPeriodSegment, yearMonth} from "../../util/Helper.util";

import "./PeriodSelector.element.scss"

interface PeriodSelectorElementProps {
  periods: {begin: string, end: string};
  activePeriod: SelectedPeriod | undefined;
  onUpdatePeriod: (selectedPeriod: SelectedPeriod) => void;
}

const PeriodSelectorElement: FC<PeriodSelectorElementProps> = ({periods, activePeriod, onUpdatePeriod}) => {

  const [periodOptions, setPeroidOptions] = useState<SelectedPeriod[]>([]);
  const [usedPeriod, setUsedPeriod] = useState(0)

  const periodDisplayString = (period: SelectedPeriod) => {
    switch (period.type) {
      case 'YH': return `${MONTHNAME[(period.segment*6)-5].substring(0, 3)}-${MONTHNAME[period.segment*6].substring(0, 3)} ${period.year}`
      case 'YQ': return `${MONTHNAME[(period.segment*3)-2].substring(0, 3)}-${MONTHNAME[period.segment*3].substring(0, 3)} ${period.year}`
      case 'YM': return `${MONTHNAME[period.segment]} ${period.year}`
      case 'Y' : return `${MONTHNAME[1].substring(0, 3)}-${MONTHNAME[12].substring(0, 3)} ${period.year}`
    }
  }

  const generatePeriodOptions = (period: 'YH' | "YQ" | 'YM' | 'Y', endMonth: number, endYear: number, beginMonth: number, beginYear: number) => {
    const options: SelectedPeriod[] = [];
    for (let y = beginYear; y <= endYear; y++) {
      const em = y === endYear ? endMonth : 12
      const bm = y === beginYear ? beginMonth : 1

      const factor = period === "Y" ? 12 : period === 'YH' ? 6 : period === "YQ" ? 3 : 1

      let m = (bm - 1 + (factor - (bm-1) % factor));
      const _em = em-1+(factor - (em-1) % factor);
      while (m <= _em) {
        options.push({type: period, segment: getPeriodSegment(period, m), year: y})
        m = (m  + (factor - (m) % factor))
      }
    }

    return options.sort((a, b) => (a.year+(a.segment*0.01)) > (b.segment*0.01+b.year) ? -1 : 1);
  }

  const onChange = (e: SelectCustomEvent<number>) => {
    const idx = e.detail.value;
    if (idx && idx > 0) {
      onUpdatePeriod(periodOptions[idx - 1]);
    }
  }

  // useEffect(() => {
  //   if (activePeriod) {
  //     const si = periodOptions.findIndex((p) => p.year === activePeriod.year && p.segment === activePeriod.segment)
  //     if (si >= 0) {
  //       setUsedPeriod(si + 1)
  //     }
  //   }
  // }, [periodOptions]);

  const periodSelectOptions = useMemo(() => {
    if (periods && activePeriod) {
      const [beginMonth, beginYear] = yearMonth(periods.begin)
      let [endMonth, endYear] = yearMonth(periods.end)

      endYear = endYear || new Date().getFullYear()
      endMonth = endMonth || new Date().getMonth()

      const options = generatePeriodOptions(activePeriod.type, endMonth, endYear, beginMonth, beginYear)
      setPeroidOptions(options);
      // setUsedPeriod(0);

      let selectedOption = 0
      const si = options.findIndex((p) => p.year === activePeriod.year && p.segment === activePeriod.segment)
      if (si >= 0) {
        selectedOption = si + 1
      }
      setUsedPeriod(selectedOption)

      return (
        <>
          {options.map((o, idx) => (
            <IonSelectOption key={idx} value={idx + 1} aria-selected>{periodDisplayString(o)}</IonSelectOption>
          ))}
        </>
      )
    } else {
      return <></>
    }
  }, [activePeriod, periods])

  return (
      <IonSelect interface="popover" justify="space-between" labelPlacement="stacked" className="select-box" value={usedPeriod} defaultValue={0} onIonChange={onChange} style={{minHeight: "0"}}>
        {periodSelectOptions}
      </IonSelect>
  )
}

export default PeriodSelectorElement;