import log from '../utils/log'
const initialState = {
  user: null,
  isAuthenticated: false,
  credentials: null,
  personId: null,
  person: null,
  isSuperAdmin: false,
  isBDFL: false,
  viewPersonId: "",
  viewPerson: null,
  displayName: "",
  photoURL: "",
  list_behaviors: {},
  timeLine: {},
  interventions: {},
  isLoading: false,
  friends: [],
  timestamp: 0
}


export default function auth(state = initialState, action) {

  switch(action.type) {
    case "login":
      return  { ...state,
                user: action.user,
                isAuthenticated: action.isAuthenticated,
                credentials: action.credentials,
                personId: action.personId,
                person: action.person,
                displayName: action.displayName || "",
                photoURL: action.photoURL || "",
                isSuperAdmin: action.isSuperAdmin,
                isBDFL: action.isBDFL,
                viewPersonId: action.viewPersonId,
                viewPerson: action.viewPerson
              }
    case "loadTimeLine":
      let f = {...state.timeLine }
      if (action.entries && !action.key) {
        f[action.viewPersonId] = action.entries
        log('loading timeline entries ', action.entries)
      }
      if (action.key && action.entry ) {
        f[action.viewPersonId][action.key] = action.entry
        log('loading timeline entry ',action.viewPersonId, action.key, action.entry, f)
      }
      return {
        ...state,
        timeLine: f,
        timestamp: Date.now()
      }
    case "loaded_friend":
      return {
        ...state,
        friends: [...state.friends, action.friend ]
      }

    case "loadInterventions":
      let i = { ...state.interventions }
      if (action.key) {
        i[action.viewPersonId] = i[action.viewPersonId] || {}

        i[action.viewPersonId][action.key] = action.interventions

      } else {
        i[action.viewPersonId] = action.interventions
      }
      return {
        ...state,
        interventions: i
      }
    case "auth":
      return { ...state, user: action.user, isAuthenticated: action.isAuthenticated}
    case "selectViewPerson":
      return { ...state, viewPersonId: action.person.key, viewPerson: action.person}
    case "selectMe":
      return { ...state, viewPersonId: state.personId, viewPerson: state.person }
    case "onListBehaviors":
      return { ...state, list_behaviors: action.list_behaviors}
    case "isLoading" :
      return { ...state, isLoading: true }
    case "doneLoading":
      return { ...state, isLoading: false }
    case "logout":
      return initialState
  }
  return state
}
