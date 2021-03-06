// import firebase from 'firebase';
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

import log from '../log'
import _ from 'lodash'
// Initialize Firebase
const config = require("json-loader!./.secret.json")

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
        person: person,
        displayName: person? person.displayName||"" : "",
        photoURL: person ? person.photoURL || person.picURL || "" : "",
        isSuperAdmin: isSuperAdmin,
        isBDFL: isBDFL,
        viewPersonId: personId,
        viewPerson: person.val?person.val():person
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
      .ref(`/users/${uid}`)
      .transaction( user => ( user || { personId: personId, email: email } ) )


    } catch(x) {
      console.log(x)
    }
}


const _retrieveFBPerson = (store, user, cb) => {
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
          log('Could not find person in db ', user, "", personId, false, false, person)
          store.dispatch(onAuthenticated(user, "", personId, false, false, person) )
          store.dispatch({type: "doneLoading"})
          cb(personId)
        } else {
          const personId = Object.keys(person)[0]
          const peep = person[personId]
          _createFBUser(user.uid, personId, user.email )
          log('Authenticated ', personId, peep.isSuperAdmin, peep.isBDFL, peep)
          store.dispatch(onAuthenticated(user, "", personId, peep.isSuperAdmin, peep.isBDFL, peep))
          store.dispatch({type: "doneLoading"})
          _loadMyFriends(store, user.uid,personId, peep)
          cb(personId)

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
      .orderByKey()
      .limitToLast(450)
      .once("value",cb)
    } catch(x) {
      console.log(x)
    }
}

const _loadNewTimeLineEntry = (viewPersonId, keyId, cb) => {
  try {
    const root = `/people/${viewPersonId}/timeline`
    if (keyId) {
      firebase
      .database()
      .ref(root)
      .orderByKey()
      .startAt(keyId)
      .on("child_added", cb)
    } else {
      firebase
      .database()
      .ref(root)
      .orderByKey()
      .on("child_added", cb)
    }

  } catch(x) {
    console.log(x)
  }
}

const _loadInterventions = (viewPersonId,cb) => {
  try {
      const root = `/interventions/${viewPersonId}`
      firebase
      .database()
      .ref(root)
      .orderByKey()
      .limitToLast(50)
      .once("value",
        (snapshot) => {
          let lastKey = ""
          if (snapshot && snapshot.val() ) {
            cb(lastKey, snapshot.val())
            const keys = Object.keys(snapshot.val())
            lastKey = keys[keys.length - 1]
          }
          firebase.database().ref(root).orderByKey().startAt(lastKey).on("child_added",
            entry => cb(entry.key, entry.val()))
        }
      )
    } catch(x) {
      console.log(x)
    }
}

const _loadInterventionModels = (store, personId, viewPersonId) => {
  const key=`/models/${viewPersonId}`
  firebase
  .database()
  .ref(key)
  .orderByChild("isDeleted")
  .equalTo(false)
  .once("value",
    snapshot => {
      if(snapshot && snapshot.val()) {
        store.dispatch({
            type:"loadInterventionModels",
            models: snapshot.val(),
        })
      }
    }
  )
}
const _loadViewPerson = (store, personId, viewPersonId ) => {
  const key=`/people/${viewPersonId}`
  firebase
  .database()
  .ref(key)
  .once("value",
    snapshot => {
      if(snapshot && snapshot.val()) {
        store.dispatch({
            type:"selectViewPerson",
            person: snapshot.val(),
            viewPersonId: viewPersonId
        })
      }
    }
  )
}
const _loadMyFriends = (store, userId,myPersonId, person) => {

  if(person && person.friends) {
    _.each(person.friends, (value, key) => {
      const myRole = value.myRole
      const friendId = value.personId
      database
      .ref(`/people/${friendId}`)
      .once("value",
        data => {
          if (data && data.val()) {
            const friend = data.val()
            store.dispatch({
              type: "loaded_friend",
              friend: {
                personId: data.key,
                key: data.key,
                displayName: friend.displayName || friend.name,
                name: friend.name || friend.displayName,
                picURL: friend.picURL,
                myRole: myRole
              }
            })
          }
        }
      )
    })
  }

}
const _monitorTimeLine = (store, userId, myPersonId) => {
  const key=`/state/${userId}/viewPersonId`
  log('Checking time line for ', key)

  let viewPersonId = ""
  firebase
  .database()
  .ref(key)
  .on("value",
    snapshot => {
      if(snapshot && snapshot.val()) {
        viewPersonId = snapshot.val()
      } else {
        viewPersonId = myPersonId
      }
      log('loading view Person ', myPersonId, viewPersonId)
      _loadViewPerson(store, myPersonId, viewPersonId)
      _loadInterventionModels(store, myPersonId, viewPersonId)
      log('loading timeline ')
      _loadTimeline(viewPersonId,
        timeLine => {

            let lastKeyId = ""

            if(timeLine && timeLine.val()) {
              store.dispatch({
                        type: "loadTimeLine",
                        viewPersonId: viewPersonId,
                        entries: timeLine.val(),
                        key: ""
              })

              const keys = Object.keys(timeLine.val())
              lastKeyId = keys[keys.length-1]
            }
            _loadNewTimeLineEntry(viewPersonId, lastKeyId,
              newEntry => {
                if (newEntry && newEntry.val() && newEntry.key !== lastKeyId) {
                  store.dispatch({
                    type: "loadTimeLine",
                    viewPersonId: viewPersonId,
                    key: newEntry.key,
                    entry: newEntry.val()
                  })
                }
              }
            )
          }
      )
      _loadInterventions(viewPersonId,
        (key,items) => {
          store.dispatch({
            type:"loadInterventions",
            viewPersonId: viewPersonId,
            interventions: items,
            key: key
          })
        })
    })
}
export default (store) => {
  firebase.auth().onAuthStateChanged(
    (user) => {
      try {
        if(user) {
          store.dispatch({type: "isLoading"})
          _retrieveFBPerson(store, user,
            personId => {
              _monitorTimeLine(store, user.uid, personId)
            }
          )

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
