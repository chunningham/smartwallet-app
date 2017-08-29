import React from 'react'
import {connect} from 'redux/utils'
import Presentation from '../presentation/access-request'

@connect({
  props: [
    'singleSignOn.accessRequest',
    'wallet.identity'
  ],
  actions: [
    'simple-dialog:configSimpleDialog',
    'simple-dialog:showSimpleDialog',
    'confirmation-dialog:openConfirmDialog',
    'confirmation-dialog:closeConfirmDialog',
    'single-sign-on/access-request:getRequesterIdentity',
    'single-sign-on/access-request:grantAccessToRequester',
    'single-sign-on/access-request:requestedDetails',
    'single-sign-on/access-request:goToMissingInfo',
    'single-sign-on/access-request:setInfoComplete',
    'verification:confirmEmail',
    'verification:confirmPhone',
    'verification:startEmailVerification',
    'verification:startPhoneVerification',
    'wallet/identity:getIdentityInformation',
    'wallet/identity:changePinValue',
    'wallet/identity:setFocusedPin'
  ]
})
export default class AccessRequestScreen extends React.Component {
  static propTypes ={
    configSimpleDialog: React.PropTypes.func.isRequired,
    showSimpleDialog: React.PropTypes.func.isRequired,
    openConfirmDialog: React.PropTypes.func.isRequired,
    getIdentityInformation: React.PropTypes.func.isRequired,
    accessRequest: React.PropTypes.any,
    location: React.PropTypes.any,
    requestedDetails: React.PropTypes.func.isRequired,
    grantAccessToRequester: React.PropTypes.func.isRequired,
    identity: React.PropTypes.any,
    startPhoneVerification: React.PropTypes.func.isRequired,
    startEmailVerification: React.PropTypes.func.isRequired,
    confirmPhone: React.PropTypes.func.isRequired,
    confirmEmail: React.PropTypes.func.isRequired,
    goToMissingInfo: React.PropTypes.func.isRequired,
    resendVerificationSms: React.PropTypes.func,
    resendVerificationLink: React.PropTypes.func,
    setInfoComplete: React.PropTypes.func.isRequired,
    changePinValue: React.PropTypes.func.isRequired,
    setFocusedPin: React.PropTypes.func.isRequired
  }

  handleWhy = (title, message) => {
    this.props.configSimpleDialog(title, message, 'OK', {}, false)
    this.props.showSimpleDialog()
  }

  handleDeny = (title, message) => {
    this.props.openConfirmDialog({
      primaryActionText: 'OK',
      cancelActionText: 'I CHANGED MY MIND',
      message: message,
      style: {
        actionsContainerStyle: {
          textAlign: 'center'
        }
      },
      callback: () => {
        window.location.href = `${this.props.location.query.returnURL}?success=true&error=denied` // eslint-disable-line max-len
      },
      title: title
    })
  }

  componentWillMount() {
    this.props.getIdentityInformation()
    this.props.requestedDetails(this.props.location)
  }

  requestVerificationCode({attrType, attrValue, index}) {
    if (attrType === 'phones') {
      return () => {
        this.props.startPhoneVerification({phone: attrValue, index})
      }
    } else if (attrType === 'emails') {
      return () => {
        this.props.startEmailVerification({email: attrValue, index})
      }
    }
  }

  enterVerificationCode({attrType, attrValue, index}) {
    if (attrType === 'phones') {
      return () => {
        this.props.confirmPhone(index)
      }
    } else if (attrType === 'emails') {
      return () => {
        this.props.confirmEmail({email: attrValue})
      }
    }
  }

  resendVerificationCode({attrType, attrValue, index}) {
    if (attrType === 'phones') {
      return () => {
        this.props.resendVerificationSms({phone: attrValue, index})
      }
    } else if (attrType === 'emails') {
      return () => {
        this.props.resendVerificationLink({email: attrValue, index})
      }
    }
  }

  onConfirm(args, params) {
    return this.showVerificationWindow(args, () => {
      return () => this.showVerificationWindow(params,
      (callbackArgs) => this.requestVerificationCode(callbackArgs))
    })
  }

  showVerificationWindow({title, message, attrValue, attrType, index, rightButtonLabel, leftButtonLabel}, callback) { // eslint-disable-line max-len
    return this.props.openConfirmDialog(
      title,
      message,
      rightButtonLabel,
      callback({attrValue, attrType, index}),
      leftButtonLabel
    )
  }

  render() {
    return (
      <Presentation
        requestedFields={this.props.accessRequest.entity.fields}
        location={this.props.location.query}
        identity={this.props.identity}
        goToMissingInfo={(...args) => { this.props.goToMissingInfo(...args) }}
        entity={this.props.accessRequest.entity}
        accessInfo={(...args) => { this.handleWhy(...args) }}
        denyAccess={(...args) => { this.handleDeny(...args) }}
        grantAccessToRequester={this.props.grantAccessToRequester}
        setInfoComplete={this.props.setInfoComplete}
        changePinValue={this.props.changePinValue}
        setFocusedPin={this.props.setFocusedPin}

        requestVerificationCode={(args, params) => this.showVerificationWindow(args, () => { // eslint-disable-line max-len
          return () => this.showVerificationWindow(params,
            (callbackArgs) => this.requestVerificationCode(callbackArgs))
        })}

        enterVerificationCode={(...args) => this.showVerificationWindow(...args,
          (...params) => this.enterVerificationCode(...params)
        )}

        resendVerificationCode={(...args) => this.showVerificationWindow(...args, // eslint-disable-line max-len
          (...params) => this.resendVerificationCode(...params)
        )}

        onConfirm={(...args) => { this.onConfirm(...args) }} />
    )
  }
}