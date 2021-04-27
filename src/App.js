import React, { useRef, useState } from 'react';
import moment from 'moment';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({    
  // your config
  apiKey: "AIzaSyBnPsys6zzZIGnhOMV-0it_5ZHhCx46Tdk",
  authDomain: "onelifechatapp.firebaseapp.com",
  projectId: "onelifechatapp",
  storageBucket: "onelifechatapp.appspot.com",
  messagingSenderId: "485699556952",
  appId: "1:485699556952:web:6ce9ad2ab2250532fa1c2d",
  measurementId: "G-T3QZ3ZTYWE"
})


const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
    <header>
      <h1>Let the Chat Start</h1>
      <SignOut />
    </header>

    <section>
      {user ? <ChatRoom /> : <SignIn />}
    </section>

  </div>
  );
}

function SignIn(){

  // It will trigger the popup window of google sign in 
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button onClick={signInWithGoogle} className="signinbtn">Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className="signout">Sign Out</button>
  )
}

function ChatRoom(){

  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField : 'id'});
  
  const [formvalue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formvalue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior : 'smooth' });
    };

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formvalue} onChange={(e) => setFormValue(e.target.value)} placeholder='Your message..'/>
        <button type="submit" disabled={!formvalue}>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const { text, uid, photoURL, createdAt } = props.message;
  var date = new Date(createdAt * 1000).toLocaleTimeString()

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recived';

  return(
    <div>
      <div className={`${messageClass} message`}>
        <img src={photoURL} alt="userimg"/>
        <p>{text} 
        <span className="metadata">
          <span className="date">{date}</span>
        </span>
        </p>
      </div>
    </div>
  )
}


export default App;
