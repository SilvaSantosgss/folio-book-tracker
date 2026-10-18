// Public Firebase client configuration. Access is enforced by Firestore security rules.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import { getFirestore, doc, getDocFromServer, onSnapshot, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

const app=initializeApp({apiKey:'AIzaSyBPXDB94o1_AF5ynTGx6Ue74KjaMn2LG6s',authDomain:'folio-book-tracker.firebaseapp.com',projectId:'folio-book-tracker',storageBucket:'folio-book-tracker.firebasestorage.app',messagingSenderId:'394823298585',appId:'1:394823298585:web:f5e3e11d4c09a5fa9c4488'});
const auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});
let ref=null,unsub=null,revision=0,busy=false,pending=null,pendingBase=0,deferred=null,ready=false,epoch=0,hasConflict=false;
const localSave=save;
const clone=x=>structuredClone(x);
const status=(text,kind='ok')=>{document.querySelector('#sync-status').textContent=text;document.querySelector('#sync-status').dataset.state=kind};
function notice(text,retry=true){document.querySelector('#cloud-notice').classList.remove('hidden');document.querySelector('#cloud-notice-text').textContent=text;document.querySelector('#cloud-retry').classList.toggle('hidden',!retry)}
function clearNotice(){document.querySelector('#cloud-notice').classList.add('hidden')}
function remember(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notify('Local storage is full. Export a backup.')}}
function pack(s,rev){return {schemaVersion:1,goal:s.goal,books:s.books,revision:rev,updatedAt:serverTimestamp()}}
function readData(data){if(!data||data.schemaVersion!==1||!Number.isInteger(data.revision)||data.revision<1||!valid(data))throw new Error('invalid-cloud-data');return {goal:data.goal,books:clone(data.books)}}
function apply(data){state=readData(data);revision=data.revision;remember();render();status('Synced with Google');clearNotice()}
function editorOpen(){return [...document.querySelectorAll('dialog')].some(d=>d.open)}
function acceptDeferred(){if(deferred&&!busy&&!pending&&!editorOpen()){const data=deferred;deferred=null;if(data.revision>revision)apply(data)}}
function fail(e){status('Changes not synced','error');const offline=!navigator.onLine||['unavailable','deadline-exceeded'].includes(e.code);notice(e.message==='sync-conflict'?'Another device changed your library. Your edits are safe on this device. Export a backup, then choose Retry sync to resolve the conflict.':offline?'Connection unavailable. Your edits are saved on this device and will retry when you reconnect.':'Cloud save failed. Your edits remain on this device. Export a backup or retry.');}
// One in-flight transaction at a time. Revision checks prevent silent cross-device overwrites.
save=function(){if(!ready||!ref){notify('Sign in and wait for your library to load before editing.');return}localSave();if(!pending)pendingBase=revision;pending=clone(state);try{localStorage.setItem('folio-pending-v1',JSON.stringify({uid:auth.currentUser.uid,base:pendingBase,state:pending}))}catch{}status('Saving to Google…','saving');flush()};
async function flush(){if(busy||!pending||!ready||!ref||hasConflict)return;if(!navigator.onLine){fail({code:'unavailable'});return}busy=true;const candidate=clone(pending),base=pendingBase,currentEpoch=epoch,target=ref;pending=null;
 try{await runTransaction(db,async tx=>{const snap=await tx.get(target);if(!snap.exists()||snap.data().revision!==base)throw new Error('sync-conflict');tx.set(target,pack(candidate,base+1))});if(currentEpoch!==epoch)return;revision=base+1;try{localStorage.removeItem('folio-pending-v1')}catch{}if(pending){pendingBase=revision;try{localStorage.setItem('folio-pending-v1',JSON.stringify({uid:auth.currentUser.uid,base:pendingBase,state:pending}))}catch{}}else{status('Synced with Google');clearNotice()}}
 catch(e){if(currentEpoch!==epoch)return;if(!pending)pending=candidate;pendingBase=base;hasConflict=e.message==='sync-conflict';fail(e)}
 finally{if(currentEpoch===epoch){busy=false;if(pending&&!hasConflict&&navigator.onLine){/* Retry explicitly after a server error; avoid loops. */}else acceptDeferred()}}
 if(pending&&!hasConflict&&revision>base)flush();
}
async function loadUser(user,myEpoch){const target=doc(db,'users',user.uid,'library','state');ref=target;const snap=await getDocFromServer(target);if(myEpoch!==epoch)return;
 if(!snap.exists()){await runTransaction(db,async tx=>{const check=await tx.get(target);if(!check.exists())tx.set(target,pack(state,1))})}
 const latest=await getDocFromServer(target);if(myEpoch!==epoch)return;const cloud=latest.data();apply(cloud);ready=true;
 let draft=null;try{draft=JSON.parse(localStorage.getItem('folio-pending-v1')||'null')}catch{}
 if(draft&&draft.uid===user.uid&&valid(draft.state)&&Number.isInteger(draft.base)){state=clone(draft.state);pending=clone(state);pendingBase=draft.base;hasConflict=pendingBase!==revision;remember();render();if(hasConflict)fail(new Error('sync-conflict'));else flush()}
 document.querySelector('#auth-gate').hidden=true;document.querySelector('main').hidden=false;document.querySelector('#cloud-signout').classList.remove('hidden');
 unsub=onSnapshot(target,{includeMetadataChanges:true},snap=>{if(myEpoch!==epoch||!snap.exists()||snap.metadata.hasPendingWrites||snap.metadata.fromCache)return;try{const data=snap.data();readData(data);if(data.revision<=revision)return;if(busy||pending||editorOpen())deferred=data;else apply(data)}catch{notice('Cloud data could not be read. Export your local library and contact support.',false);status('Sync needs attention','error')}},e=>{status('Cloud connection interrupted','error');notice('Cloud updates are unavailable. Local changes are retained; reconnect or sign in again.');});
}
async function handleUser(user){const myEpoch=++epoch;if(unsub){unsub();unsub=null}ready=false;busy=false;ref=null;pending=null;deferred=null;hasConflict=false;document.querySelector('main').hidden=true;document.querySelector('#auth-gate').hidden=false;document.querySelector('#cloud-signout').classList.add('hidden');clearNotice();
 if(!user){status('Private Google library');document.querySelector('#auth-message').textContent='Sign in to continue. Your library is visible only after authentication.';document.querySelector('#cloud-signin').disabled=false;document.querySelector('#cloud-signin').textContent='Continue with Google';return}
 document.querySelector('#cloud-signin').disabled=true;document.querySelector('#cloud-signin').textContent='Loading your library…';document.querySelector('#auth-message').textContent='Checking your private database access…';status('Connecting…','saving');
 try{await loadUser(user,myEpoch)}catch(e){if(myEpoch!==epoch)return;document.querySelector('#auth-message').textContent=e.code==='permission-denied'?'This Google account is not authorized. Sign in with the project owner’s account.':'Unable to load the cloud library. Check your connection, then try again. Your local books have not been removed.';document.querySelector('#cloud-signin').disabled=false;document.querySelector('#cloud-signin').textContent='Try Google sign-in again';status('Not connected','error');}
}
document.querySelector('#cloud-signin').onclick=async()=>{try{document.querySelector('#cloud-signin').disabled=true;await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,provider)}catch(e){document.querySelector('#cloud-signin').disabled=false;document.querySelector('#cloud-signin').textContent='Continue with Google';document.querySelector('#auth-message').textContent=e.code==='auth/popup-blocked'?'Allow pop-ups for this site, then try again.':e.code==='auth/popup-closed-by-user'?'Sign-in was cancelled. Try again when ready.':'Google sign-in could not finish. Please try again.'}};
document.querySelector('#cloud-signout').onclick=async()=>{if((pending||busy)&&!confirm('Some changes are not synced. Export a backup before signing out. Sign out anyway?'))return;for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();await signOut(auth)};
document.querySelector('#cloud-retry').onclick=async()=>{if(!ready){if(auth.currentUser)handleUser(auth.currentUser);return}if(hasConflict){if(!confirm('Another device has a newer cloud library. Replace the cloud library with the edits currently on this device? Cancel keeps both copies unchanged. Export a backup first if unsure.'))return;try{const snap=await getDocFromServer(ref);if(!snap.exists())throw Error();localStorage.setItem('folio-cloud-before-conflict-v1',JSON.stringify(snap.data()));pendingBase=snap.data().revision;revision=pendingBase;hasConflict=false}catch{notify('Unable to read the cloud library. Try again later.');return}}flush()};
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',acceptDeferred);
window.addEventListener('online',()=>{if(ready)flush()});window.addEventListener('offline',()=>{if(ready){status('Offline — saved on device','error');notice('Offline. Changes will be saved on this device until your connection returns.',false)}});
window.addEventListener('beforeunload',e=>{if(pending||busy){e.preventDefault();e.returnValue=''}});
onAuthStateChanged(auth,handleUser);
setTimeout(()=>{if(!ready&&!auth.currentUser&&document.querySelector('#cloud-signin').disabled){document.querySelector('#auth-message').textContent='Google services are taking longer than expected. Check your connection and reload.'}},15000);
