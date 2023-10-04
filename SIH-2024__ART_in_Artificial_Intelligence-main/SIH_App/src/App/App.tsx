import React, { useState, useEffect } from "react";
import {
  IonApp,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonFab,
  IonFabButton,
  IonPopover,
  IonPage,
  IonMenu,
  IonLoading,
} from "@ionic/react";
import { settings, menu, download, logoPaypal} from "ionicons/icons";

import * as AppGeneral from "../socialcalc/AppGeneral";
import { DATA } from "../app-data.js";

import Menu from "../Menu/Menu";

import "./App.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import Files from "../Files/Files";
import NewFile from "../NewFile/NewFile";
import { Local } from "../storage/LocalStorage";
import Login from "../Login/Login";

import { AppLauncher } from '@capacitor/app-launcher';
import { Dialog } from '@capacitor/dialog';
import { Preferences } from '@capacitor/preferences';

/* Theme variables */
// import "../theme/variables.css";

import * as firebase from "firebase/app"; // Import Firebase

const firebaseConfig = {
  apiKey: "AIzaSyD3aQcGIhwqzeSXWJ4OOGniQGiGg1ze5KY",
  authDomain: "sihprogwebapp.firebaseapp.com",
  projectId: "sihprogwebapp",
  storageBucket: "sihprogwebapp.appspot.com",
  messagingSenderId: "713116411305",
  appId: "1:713116411305:web:d0cdd36a4c44c1498cd0b8"
};


// Initialize Firebase
export const app = firebase.initializeApp(firebaseConfig)

// export const auth = firebase.auth();
const App: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({ open: false, event: undefined });
  const [selectedFile, updateSelectedFile] = useState("default");
  const [introSeen, setIntroSeen] = useState(false);
  const [billType, updateBillType] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [device] = useState(AppGeneral.getDeviceType());

  const store = new Local();

  const closeMenu = () => {
    setShowMenu(false);
  };

  const activateFooter = (footer) => {
    AppGeneral.activateFooterButton(footer);
  };

  const setName = async () => {
    await Preferences.set({
      key: 'introSeen',
      value: 'true',
    });
  };
  
  const checkName = async () => {
    const { value } = await Preferences.get({ key: 'introSeen' });
    setIntroSeen(value === 'true')
  };
  
  const showIntro = async () => {
    if(!introSeen) {
      await Dialog.alert({
        title: 'Welcome to Imperial Order',
        message: 'Our Government Billing and Invoicing System Prototype',
      });
    }
  };

  useEffect(() => {
    const data = DATA["home"][device]["msc"];
    AppGeneral.initializeApp(JSON.stringify(data));
    checkName();
    setName();
    showIntro();
  }, []);

  useEffect(() => {
    activateFooter(billType);
  }, [billType]);

  function downloadCSVFile(csvData, name) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${name}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } 
  
  const checkCanOpenUrl = async () => {
    const { value } = await AppLauncher.canOpenUrl({ url: 'Net.one97.paytm://' });
  
    console.log('Can open url: ', value);
  };
  
  const openPaytm = async () => {
    await AppLauncher.openUrl({ url: 'Net.one97.paytm://' });
  };

  const showAlert = async () => {
    await Dialog.alert({
      title: 'Download Complete',
      message: 'File has been downloaded',
    });
  };

  const footers = DATA["home"][device]["footers"];
  const footersList = footers.map((footerArray) => {
    return (
      <IonButton
        key={footerArray.index}
        expand="full"
        color="light"
        className="ion-no-margin"
        onClick={() => {
          updateBillType(footerArray.index);
          activateFooter(footerArray.index);
          setShowPopover({ open: false, event: undefined });
        }}
      >
        {footerArray.name}
      </IonButton>
    );
  });

  return (
    <IonApp>
      <IonLoading isOpen={true} message="Loading" showBackdrop={true} duration={3000} />
      <IonPage>
        <IonContent>
          <IonHeader>
            <IonToolbar color="tertiary">
              <Login />

              {selectedFile === "default" ? (
                <IonIcon
                  icon={settings}
                  slot="end"
                  className="ion-padding-end"
                  size="large"
                  onClick={(e) => {
                    setShowPopover({ open: true, event: e.nativeEvent });
                    console.log("Popover clicked");
                  }}
                />
              ) : null}
              <IonIcon
                  icon={download}
                  slot="end"
                  className="ion-padding-end"
                  size="large"
                  onClick={(e) => {
                    const data = AppGeneral.getCSVContent();
                    downloadCSVFile(data, selectedFile);
                    showAlert();
                  }}
                />
                <IonIcon
                  icon={logoPaypal}
                  slot="end"
                  className="ion-padding-end"
                  size="large"
                  onClick={(e) => {
                    if(checkCanOpenUrl()) openPaytm();
                  }}
                />
              <Files
                store={store}
                file={selectedFile}
                updateSelectedFile={updateSelectedFile}
                updateBillType={updateBillType}
              />

              <NewFile
                file={selectedFile}
                updateSelectedFile={updateSelectedFile}
                store={store}
                billType={billType}
              />

              <IonPopover
                animated
                keyboardClose
                backdropDismiss
                event={showPopover.event}
                isOpen={showPopover.open}
                onDidDismiss={() =>
                  setShowPopover({ open: false, event: undefined })
                }
              >
                {footersList}
              </IonPopover>
            </IonToolbar>
          </IonHeader>
          {/* <IonToolbar color="secondary">
            <IonTitle className="ion-text-center">
              Editing : {selectedFile}
            </IonTitle>
          </IonToolbar> */}

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton type="button" onClick={() => setShowMenu(true)}>
              <IonIcon icon={menu} />
            </IonFabButton>
          </IonFab>
          <Menu
            showM={showMenu}
            setM={closeMenu}
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            store={store}
            bT={billType}
          />
          <div id="workbookControl"></div>
          <div id="tableeditor">editor goes here</div>
          <div id="msg"></div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;
