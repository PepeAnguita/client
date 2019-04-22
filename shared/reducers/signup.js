// @flow
import * as Types from '../constants/types/signup'
import * as Constants from '../constants/signup'
import * as SignupGen from '../actions/signup-gen'
import HiddenString from '../util/hidden-string'
import {trim} from 'lodash-es'
import {isValidEmail, isValidName, isValidUsername} from '../util/simple-validators'
import * as Flow from '../util/flow'

const initialState: Types.State = Constants.makeState()

export default function(state: Types.State = initialState, action: SignupGen.Actions): Types.State {
  switch (action.type) {
    case SignupGen.resetStore: // fallthrough
    case SignupGen.restartSignup:
      return initialState
    case SignupGen.goBackAndClearErrors:
      return state.merge({
        devicenameError: '',
        emailError: '',
        inviteCodeError: '',
        nameError: '',
        passwordError: new HiddenString(''),
        signupError: new HiddenString(''),
        usernameError: '',
      })
    case SignupGen.requestedAutoInvite:
      return state.merge({inviteCode: action.error ? '' : action.payload.inviteCode})
    case SignupGen.checkInviteCode:
      return state.merge({inviteCode: action.payload.inviteCode})
    case SignupGen.checkedInviteCode:
      return action.payload.inviteCode === state.inviteCode
        ? state.merge({inviteCodeError: (action.error && action.payload.error) || ''})
        : state
    case SignupGen.checkEmail:
      const {email} = action.payload
      const emailError = isValidEmail(email)
      return state.merge({email, emailError})
    case SignupGen.checkUsername:
      const {username} = action.payload
      const usernameError = isValidUsername(username)
      return state.merge({username, usernameError})
    case SignupGen.checkedUsername:
      return action.payload.username === state.username
        ? state.merge({
            usernameError: action.error && action.payload.usernameError,
            usernameTaken: action.error && action.payload.usernameTaken,
          })
        : state
    case SignupGen.checkUsernameEmail: {
      const {email, username} = action.payload
      const emailError = isValidEmail(email)
      const usernameError = isValidUsername(username)
      return state.merge({email, emailError, username, usernameError})
    }
    case SignupGen.checkedUsernameEmail:
      return action.payload.email === state.email && action.payload.username === state.username
        ? state.merge({
            emailError: (action.error && action.payload.emailError) || '',
            usernameError: (action.error && action.payload.usernameError) || '',
          })
        : state
    case SignupGen.requestInvite: {
      const {email, name} = action.payload
      const emailError = isValidEmail(email)
      const nameError = isValidName(name)
      return state.merge({
        email: action.payload.email,
        emailError,
        name: action.payload.name,
        nameError,
      })
    }
    case SignupGen.requestedInvite:
      return action.payload.email === state.email && action.payload.name === state.name
        ? state.merge({
            emailError: (action.error && action.payload.emailError) || '',
            nameError: (action.error && action.payload.nameError) || '',
          })
        : state
    case SignupGen.checkPassword: {
      const {pass1, pass2} = action.payload
      const p1 = pass1.stringValue()
      const p2 = pass2.stringValue()
      let passwordError = new HiddenString('')
      if (!p1 || !p2) {
        passwordError = new HiddenString('Fields cannot be blank')
      } else if (p1 !== p2) {
        passwordError = new HiddenString('Passwords must match')
      } else if (p1.length < 8) {
        passwordError = new HiddenString('Password must be at least 8 characters long')
      }
      return state.merge({
        password: action.payload.pass1,
        passwordError,
      })
    }
    case SignupGen.checkDevicename: {
      const devicename = trim(action.payload.devicename)
      const devicenameError = devicename.length === 0 ? 'Device name must not be empty.' : ''
      return state.merge({devicename, devicenameError})
    }
    case SignupGen.checkedDevicename:
      return action.payload.devicename === state.devicename
        ? state.merge({devicenameError: (action.error && action.payload.error) || ''})
        : state
    case SignupGen.signedup:
      return state.merge({signupError: (action.error && action.payload.error) || new HiddenString('')})
    // Saga only actions
    case SignupGen.requestAutoInvite:
      return state
    default:
      Flow.ifFlowComplainsAboutThisFunctionYouHaventHandledAllCasesInASwitch(action)
      return state
  }
}
