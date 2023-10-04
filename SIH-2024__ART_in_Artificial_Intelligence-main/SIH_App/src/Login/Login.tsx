import React, { useEffect, useState } from "react";
import {
  IonIcon,
  IonButton,
  IonInput,
  IonList,
  IonItem,
  IonModal,
} from "@ionic/react";
import { person } from "ionicons/icons";
import { Cloud } from "../storage/CloudStorage";
import { APP_NAME } from "../app-data.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../App/App";

const provider = new GoogleAuthProvider();

const Login: React.FC = () => {
  const [login, setlLogin] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem("sih-user")));

  const cloud = new Cloud();
  const auth = getAuth(app);

  auth.onAuthStateChanged((user) => {
    if (user) setUser(user);
  })

  const doAuth = async () => {
    // console.log("Loggin in... " + email);
    // setlLogin(true);
    // const data = { email: email, password: password, appname: APP_NAME };
    // cloud._auth(data);
    console.log("Loggin in... " + email);
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log(user);
        localStorage.setItem("govt-user", JSON.stringify(user));
        setlLogin(true);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });

    // try {
    //   const user = await signInWithEmailAndPassword(auth, email, password);
    //   console.log(user);
    //   setlLogin(true);
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const loginForm = () => {
    const user = auth.currentUser;

    if (openLoginModal) {
      return (
        <IonModal
          isOpen={openLoginModal}
          animated
          onDidDismiss={() => setOpenLoginModal(false)}
        >
          <IonList>
            <IonItem>
              <IonInput
                required
                clearInput
                inputMode="email"
                pattern="email"
                id="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value)}
                placeholder="Email.."
              />
            </IonItem>
            <IonItem>
              <IonInput
                required
                clearInput
                pattern="password"
                id="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value)}
                placeholder="Password.."
              />
            </IonItem>
            <IonButton
              expand="full"
              className="ion-text-center"
              onClick={() => {
                doAuth();
                setOpenLoginModal(false);
              }}
            >
              Login
            </IonButton>
            <IonButton
              expand="block"
              color="secondary"
              onClick={() => {
                setOpenLoginModal(false);
              }}
            >
              Back
            </IonButton>
          </IonList>
        </IonModal>
      );
    } else return null;
  };

  return (
    <React.Fragment>
      <IonButton color="medium"
        slot="start"
        className="ion-padding-start"
        onClick={() => {
          // auth(login);
          // if (!login) setOpenLoginModal(true);
          // else setlLogin(false);
          if (login) {
            auth.signOut();
            setlLogin(false);
          } else {
            doAuth();
          }
        }}
      >
        <IonIcon icon={person} size="large" />
        {user ? "Logout" : "Login"}
      </IonButton>
      {/* {loginForm()} */}
      {
        user && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem",
        marginLeft: "1rem" }}>
        <img
          src={user?.photoURL}
          style={{ height: "30px", aspectRatio: "1", borderRadius: "50%" }}
        />
        {window.screen.width > 600 && user?.email}
      </div>
      }
      
    </React.Fragment>
  );
};

export default Login;
