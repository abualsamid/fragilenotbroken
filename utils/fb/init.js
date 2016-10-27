import firebase from 'firebase';
import log from '../log'
// Initialize Firebase
var config = {
  apiKey: "AIzaSyAy4ypdtNBZPz9Cr0t8IUHSAwB8S4_sYoE",
  authDomain: "fragilenotbroken-ccc45.firebaseapp.com",
  databaseURL: "https://fragilenotbroken-ccc45.firebaseio.com",
  storageBucket: "fragilenotbroken-ccc45.appspot.com",
};
firebase.initializeApp(config);
const database = firebase.database()

const onLogout  = () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
  })


const onAuthenticated =  (user, credentials, personId, isSuperAdmin=false, isBDFL=false, person=null ) => {
      return {
        type: "login",
        user: user,
        isAuthenticated: true,
        credentials: credentials,
        personId: personId,
        displayName: person? person.displayName||"" : "",
        photoURL: person ? person.photoURL || person.picURL || "" : "",
        isSuperAdmin: isSuperAdmin,
        isBDFL: isBDFL,
        viewPersonId: personId,
        viewPerson: person,

      }
    }

const reAuth =  (user) => ({
        type: "auth",
        user: user,
        isAuthenticated: true
    })

const onListBehaviors = (behaviors) => ({
      type: "onListBehaviors",
      list_behaviors: behaviors
    })

const _createFBUser = (uid, personId, email)  => {
  try {
      firebase
      .database()
      .ref("users/" + uid)
      .once("value",
        one => {
          const u = one.val()
          if (!u) {
            firebase
            .database()
            .ref("users/" + uid)
            .push({
              personId: personId,
              email: email
            })
          }
        }
      )
    } catch(x) {
      console.log(x)
    }
}


const _retrieveFBPerson = (store, user) => {
  try {
    firebase
    .database()
    .ref("people")
    .orderByChild("uid")
    .equalTo(user.uid)
    .limitToFirst(1)
    .once(
      "value",
      (one) => {
        let person = one.val()
        if (!person) {
          person = {
            uid: user.uid ,
            email: user.email,
            displayName: user.displayName || user.email,
            photoURL: user.photoURL || ""
          }
          const personId = firebase
                            .database()
                            .ref("people")
                            .push(person)
                            .key
          _createFBUser(user.uid, personId, user.email )
          store.dispatch(onAuthenticated(user, "", personId, false, false, person) )
          store.dispatch({type: "doneLoading"})

        } else {
          const personId = Object.keys(person)[0]
          const peep = person[personId]
          _createFBUser(user.uid, personId, user.email )
          store.dispatch(onAuthenticated(user, "", personId, peep.isSuperAdmin, peep.isBDFL, peep))
          store.dispatch({type: "doneLoading"})
          
        }
      }
    )

  } catch(x) {
    console.log(x)
  }
}

const _loadTimeline = (viewPersonId,cb) => {

  try {
      const root = `/people/${viewPersonId}/timeline`
      firebase
      .database()
      .ref(root)
      .limitToLast(50)
      .on("value",cb)
    } catch(x) {
      console.log(x)
    }
}
const _loadViewPerson = (store, personId, viewPersonId ) => {
  const key=`/people/${viewPersonId}`
  log('loadPerson ', key )
  firebase
  .database()
  .ref(key)
  .once("value",
    snapshot => {
      if(snapshot && snapshot.val()) {
        log('in init::_loadViewPerson, dispatching selectViewPerson ', snapshot, snapshot.val())
        store.dispatch({
            type:"selectViewPerson",
            person: snapshot
        })
      }
    }
  )
}
const _monitorTimeLine = (store, userId) => {
  const key=`/state/${userId}/viewPersonId`
  firebase
  .database()
  .ref(key)
  .on("value",
    snapshot => {
      if(snapshot && snapshot.val()) {
        const viewPersonId = snapshot.val()

        _loadViewPerson(store, store.getState().auth.personId, viewPersonId)
        _loadTimeline(viewPersonId,
          timeLine => {
            store.dispatch({
                        type: "loadTimeLine",
                        viewPersonId: viewPersonId,
                        timeLine: timeLine.val()
              })
            }
        )
      }

    })
}
export default (store) => {
  console.log('in init, store is ', store )
  firebase.auth().onAuthStateChanged(
    (user) => {
      try {
        if(user) {
          store.dispatch({type: "isLoading"})
          _retrieveFBPerson(store, user)
          _monitorTimeLine(store, user.uid)

        } else {
          store.dispatch(onLogout())
        }
      } catch(x) {
        console.log('init: ', x)
      }
    }
  )

  try {
    database
    .ref("list_behaviors")
    .once("value",
      snap => {
        if (snap && snap.val() ) {
          try {
            store.dispatch(onListBehaviors(snap.val()))
          } catch(x) {
            console.log(x)
          }
        }
      }
    )
  } catch(x) {
    console.log('doh list_behaviors ', x)
  }

}
