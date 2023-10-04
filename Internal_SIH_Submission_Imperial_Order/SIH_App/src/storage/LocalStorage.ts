import { Plugins } from "@capacitor/core";
import { getAuth } from "firebase/auth";
import { app } from "../App/App";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs, getDoc, deleteDoc } from "firebase/firestore";

const { Storage } = Plugins;

export class File {
  created: string;
  modified: string;
  name: string;
  content: string;
  billType: number;

  constructor(
    created: string,
    modified: string,
    content: string,
    name: string,
    billType: number
  ) {
    this.created = created;
    this.modified = modified;
    this.content = content;
    this.name = name;
    this.billType = billType;
  }
}

export class Local {
  _saveFile = async (file: File) => {
    let data = {
      created: file.created,
      modified: file.modified,
      content: file.content,
      name: file.name,
      billType: file.billType,
    };

    const auth = getAuth(app);
    const db = getFirestore(app);

    // await Storage.set({
    //   key: file.name,
    //   value: JSON.stringify(data),
    // });

    if (auth.currentUser) {
      const id = auth.currentUser.uid;
      console.log(data);
      await setDoc(doc(db, id, file.name), {
        key: file.name,
        value: JSON.stringify(data),
      });
    }
  };

  _getFile = async (name: string) => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    if (auth.currentUser) {
      const id = auth.currentUser.uid;
      const docSnap = await getDoc(doc(db, id, name));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return JSON.parse(data.value);
      }
    }

    const rawData = await Storage.get({ key: name });
    return JSON.parse(rawData.value);
  };

  _getAllFiles = async () => {
    let arr = {};
    // const { keys } = await Storage.keys();
    // console.log(keys);
    // for (let i = 0; i < keys.length; i++) {
    //   let fname = keys[i];
    //   const data = await this._getFile(fname);
    //   arr[fname] = (data as any).modified;
    // }

    const auth = getAuth(app);
    const db = getFirestore(app);
    if (auth.currentUser) {
      const id = auth.currentUser.uid;
      const querySnapshot = await getDocs(collection(db, id));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        arr[data.key] = JSON.parse(data.value).modified;
        console.log(doc.id, " => ", doc.data());
      });
    }

    return arr;
  };

  _deleteFile = async (name: string) => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    if (auth.currentUser) {
      const id = auth.currentUser.uid;
      await deleteDoc(doc(db, id, name));
    }
    // await Storage.remove({ key: name });
  };

  _checkKey = async (key) => {
    const { keys } = await Storage.keys();
    if (keys.includes(key, 0)) {
      return true;
    } else {
      return false;
    }
  };
}
