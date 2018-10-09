import { Dispatch, AnyAction } from 'redux'
import { JolocomLib } from 'jolocom-lib'
import { StateCredentialRequestSummary, StateVerificationSummary, StateTypeSummary, StateAttributeSummary } from 'src/reducers/sso' // StateAttributeSummary, StateTypeSummary,
import { BackendMiddleware } from 'src/backendMiddleware'
import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential';
import { showErrorScreen } from 'src/actions/generic'

export const setCredentialRequest = (request: StateCredentialRequestSummary) => {
  return {
    type: 'SET_CREDENTIAL_REQUEST',
    value: request
  }
}

export const clearCredentialRequest = () => {
  return {
    type: 'CLEAR_CREDENTIAL_REQUEST'
  }
}

export const consumeCredentialRequest = (jwtEncodedCR: string) => {
  return async(dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { storageLib } = backendMiddleware
    const credentialRequest = JolocomLib.parse.interactionJSONWebToken.fromJSON(jwtEncodedCR)
    const requestedTypes = credentialRequest.getRequestedCredentialTypes()

    const credentialRequests = await Promise.all<StateTypeSummary>(requestedTypes.map(async (type: string[]) => {
      const values: string[] = await storageLib.get.attributesByType(type)

      const attributeSummaries = await Promise.all<StateAttributeSummary>(values.map(async value => {
        const verifications: SignedCredential[] = await storageLib.get.vCredentialsByAttributeValue(value)
        const json = verifications.map(v => v.toJSON())
        const validVerifications = credentialRequest.applyConstraints(json)

        const { did } = getState().account.did.toJS()

        const verificationSummaries = validVerifications.map((verification: SignedCredential) => ({
          id: verification.getId(),
          selfSigned: verification.getIssuer() === did,
          issuer: verification.getIssuer(),
          expires: verification.getExpiryDate()
        }))

        return {
          value,
          verifications: verificationSummaries
        }
      }))

      return {
        type,
        credentials: attributeSummaries
      }
    }))

    const summary = {
      requester: credentialRequest.getRequester(),
      callbackURL: credentialRequest.getCallbackURL(),
      request: credentialRequests
    }

    dispatch(setCredentialRequest(summary))
    dispatch(navigationActions.navigate({routeName: routeList.Consent}))
  }
}

// TODO Decrypt when fetching from storage
export const sendCredentialResponse = (selectedCredentials: StateVerificationSummary[]) => {
  return async(dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { storageLib, keyChainLib, encryptionLib, ethereumLib } = backendMiddleware

    const encryptionPass = await keyChainLib.getPassword()
    const currentDid = getState().account.did.get('did')
    const personaData = await storageLib.get.persona({did: currentDid})
    const { encryptedWif } = personaData[0].controllingKey

    const decryptedWif = encryptionLib.decryptWithPass({
      cipher: encryptedWif,
      pass: encryptionPass
    })

    const { privateKey } = ethereumLib.wifToEthereumKey(decryptedWif)

    const registry = JolocomLib.registry.jolocom.create()
    const wallet = await registry.authenticate(Buffer.from(privateKey, 'hex'))

    const credentials = await Promise.all(selectedCredentials.map(async cred => {
      const results = await storageLib.get.verifiableCredential({id: cred.id})
      return results[0]
    }))

    const jsonCredentials = credentials.map(cred => cred.toJSON())
    const credentialResponse = await wallet.create.credentialResponseJSONWebToken({
      typ: 'credentialResponse',
      credentialResponse: {
        suppliedCredentials: jsonCredentials
      }
    })

    const { callbackURL } = getState().sso.activeCredentialRequest

    // TODO Do we care about the response?
    try {
      await fetch(callbackURL, {
        method: 'POST',
        body: JSON.stringify({token: credentialResponse}),
        headers: {'content-type': 'application/json'}
      })

      dispatch(clearCredentialRequest())
      dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
    } catch(err) {
      dispatch(showErrorScreen(err))
    }
  }
}

export const cancelSSO = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(clearCredentialRequest())
    dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
  }
}