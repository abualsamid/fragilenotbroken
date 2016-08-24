
const initialState = {
  user: null,
  isAuthenticated: false,
  credentials: null,
  personId: null,
  isSuperAdmin: false,
  isBDFL: false
}
export default function auth(state = initialState, action) {
  switch(action.type) {
    case "login":
      return  { ...state,
                user: action.user,
                isAuthenticated: action.isAuthenticated,
                credentials: action.credentials,
                personId: action.personId,
                isSuperAdmin: action.isSuperAdmin,
                isBDFL: action.isBDFL
              }
    case "auth":
      return { ...state, user: action.user, isAuthenticated: action.isAuthenticated}
    case "logout":
      return { ...state, user: null, isAuthenticated: false  }
  }
  return state
}
