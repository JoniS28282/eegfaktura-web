import React, {FC, useContext} from "react";
import {IonContent, IonPage, SelectCustomEvent} from "@ionic/react";
import ParticipantPaneComponent from "../components/participantPane/ParticipantPane.component";

import "./Participants.css"
import {useAppDispatch, useAppSelector} from "../store";
import {participantsSelector, selectedParticipantSelector} from "../store/participant";
import {periodsSelector, selectedPeriodSelector} from "../store/energy";
import {selectedTenant} from "../store/eeg";
import ParticipantDetailsPaneComponent from "../components/participantPane/ParticipantDetailsPane.component";
import ParticipantInvoiceDetailsComponent from "../components/participantPane/ParticipantInvoiceDetails.component";
import {ParticipantContext} from "../store/hook/ParticipantProvider";
import AddMeterPaneComponent from "../components/participantPane/AddMeterPane.component";

const Participants: FC = () => {
  const dispatcher = useAppDispatch();
  const periods = useAppSelector(periodsSelector);
  const tenant = useAppSelector(selectedTenant);
  const activePeriod = useAppSelector(selectedPeriodSelector);
  const participants = useAppSelector(participantsSelector);

  const selectedParticipant = useAppSelector(selectedParticipantSelector);

  const {
    billingEnabled,
    showAddMeterPane,
  } = useContext(ParticipantContext);

  function showParticipantDetails() {
    if (selectedParticipant) {
      if (billingEnabled) {
        return (
          <ParticipantInvoiceDetailsComponent />
        )
      } else if (showAddMeterPane) {
        return (
          <AddMeterPaneComponent />
        )
      }else {
        return (
          <ParticipantDetailsPaneComponent />
        )
      }
    } else {
      return (
        <></>
      )
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen color="eeg">
        <div style={{display:"flex", flexDirection:"row"}}>
          <div>
            <ParticipantPaneComponent
              participants={participants}
              activePeriod={activePeriod}
              onUpdatePeriod={(e: SelectCustomEvent<number>) => console.log("Update Period", e)}
              periods={periods}
            />
          </div>
          <div style={{flexGrow:"1", background: "#EAE7D9"}}>
            {showParticipantDetails()}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
};

export default Participants;