import React, {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../index";
import {eegSelector, fetchEegModel, selectedTenant, selectTenant} from "../eeg";
import {KeycloakContext, useKeycloak, useRoles, useTenants} from "./AuthProvider";
import {fetchRatesModel} from "../rate";
import {fetchParticipantModel} from "../participant";
import {fetchEnergyReport, setSelectedPeriod} from "../energy";
import {eegService} from "../../service/eeg.service";
import {useIonViewDidEnter, useIonViewWillEnter} from "@ionic/react";
import {Eeg, EegTariff} from "../../models/eeg.model";
import {EegParticipant} from "../../models/members.model";


export interface EegState {
  eeg: Eeg | undefined
  isAdmin: () => boolean
  isOwner: () => boolean
  isUser: () => boolean
  refresh: () => void
}

const initialState: EegState = {
  eeg: undefined,
  isAdmin: () => false,
  isOwner: () => false,
  isUser: () => false,
  refresh: () => {},
}


export const EegContext = createContext(initialState)

export const EegProvider: FC<{ children: ReactNode }> = ({children}) => {

  const dispatch = useAppDispatch();
  const {keycloak} = useKeycloak();
  const tenants = useTenants();
  const roles = useRoles();

  const tenant = useAppSelector(selectedTenant)

  const eeg = useAppSelector(eegSelector);

  useEffect(() => {
    // console.log("APP STATE CHANGED: ", state)
    if (tenant) init()
  }, [tenant])

  useEffect(() => {
    const storedTenant = localStorage.getItem("tenant")
    if (storedTenant) {
      if (!tenant) {
        dispatch(selectTenant(storedTenant))
      }
    }
  }, [tenants])

  useEffect(() => {
    if (eeg) {
      eegService.fetchLastReportEntryDate(tenant).then(lastReportDate => {
        if (lastReportDate && lastReportDate.length > 0) {
          const [date, time] = lastReportDate.split(" ");
          const [day, month, year] = date.split(".");
          let period = "Y"
          let segment = 0
          switch (eeg.settlementInterval) {
            case "MONTHLY":
              period = "YM"
              segment = parseInt(month, 10)
              break;
            case "BIANNUAL":
              period = "YH"
              segment = (parseInt(month, 10) < 7 ? 1 : 2)
              break;
            case "QUARTER":
              const m = parseInt(month, 10)
              period = "YQ"
              segment = (m < 4 ? 1 : m < 7 ? 2 : m < 10 ? 3 : 4)
              break
          }
          dispatch(fetchEnergyReport({tenant: tenant, year: parseInt(year, 10), segment: segment, type: period}))
        }
      })
    }
  },[eeg])

  const init = async () => {
    let initTenant = tenant

    if (!initTenant) {
      const storedTenant = localStorage.getItem("tenant")
      if (storedTenant) {
        dispatch(selectTenant(storedTenant))
        initTenant = storedTenant
      }
    }
    if (initTenant && initTenant.length > 0) {
      console.log("Fetch EEG DATA")
      keycloak.getToken().then((token) => {
        Promise.all([
          dispatch(fetchEegModel({token: token, tenant: initTenant!})),
          dispatch(fetchRatesModel({token: token, tenant: initTenant!})),
          dispatch(fetchParticipantModel({token: token, tenant: initTenant!})),
          // eegService.fetchLastReportEntryDate(initTenant, token).then(lastReportDate => {
          //   if (lastReportDate && lastReportDate.length > 0) {
          //     const [date, time] = lastReportDate.split(" ");
          //     const [day, month, year] = date.split(".")
          //     // dispatch(setSelectedPeriod({type: "MRP", month: Number(month), year: Number(year)}))
          //     dispatch(fetchEnergyReport({tenant: initTenant!, year: parseInt(year, 10), month: parseInt(month, 10), token}))
          //   }
          // }),
        ])
      })
    }
  }

  // useEffect(() => {
  //   console.log("Dispatch / tenant changed")
  //
  // }, [dispatch, tenant])

  useIonViewDidEnter(() => {
    console.log("Ion Did Enter View")
    // if (!tenant) {
    //   const tenant = localStorage.getItem("tenant")
    //   dispatch(selectTenant(tenant!))
    // }
  })

  useIonViewWillEnter(() => {
    console.log("View will Enter")
  })

  const value = {
    eeg: eeg,
    isAdmin: () => roles.findIndex(r => r === "/EEG_ADMIN") >= 0,
    isOwner: () => roles.findIndex(r => r === "/EEG_OWNER") >= 0,
    isUser: () => roles.findIndex(r => r === "/EEG_USER") >= 0,
    refresh: async () => await init()
  } as EegState

  return (
    <EegContext.Provider value={value}>
      {children}
    </EegContext.Provider>
  )
}

export const useAccessGroups = () => {
  const {isAdmin, isUser, isOwner} = useContext(EegContext);
  return {isAdmin, isUser, isOwner};
}

export const useRefresh = () => {
  const {refresh} = useContext(EegContext);
  return {refresh};
}