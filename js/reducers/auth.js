
const initialState = {
  user: null,
  isAuthenticated: false,
  credentials: null,
  personId: null,
  isSuperAdmin: false,
  isBDFL: false,
  viewPersonId: "",
  viewPerson: null
}


export default function auth(state = initialState, action) {
  switch(action.type) {
    case "login":
      console.log('reducing login ', action )
      return  { ...state,
                user: action.user,
                isAuthenticated: action.isAuthenticated,
                credentials: action.credentials,
                personId: action.personId,
                isSuperAdmin: action.isSuperAdmin,
                isBDFL: action.isBDFL,
                viewPersonId: action.viewPersonId,
                viewPerson: action.viewPerson
              }
    case "auth":
      return { ...state, user: action.user, isAuthenticated: action.isAuthenticated}
    case "selectViewPerson":
      console.log('selecting student ', action.person )
      return { ...state, viewPersonId: action.person.key, viewPerson: action.person.val()}

    case "logout":
      return initialState
  }
  return state
}
