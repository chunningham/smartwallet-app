import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'redux_state/utils'
import Presentation from '../presentation/identity-new'

@connect({
  props: ['wallet.identityNew'],
  actions: [
    'wallet/identity-new:toggleEditField',
    'wallet/identity-new:enterField',
    'wallet/identity-new:saveAttribute',
    'wallet/identity-new:toggleQRScan',
    'wallet/identity-new:retrieveAttributes'
  ]
})
export default class IdentityScreenNew extends React.Component {
  static propTypes = {
    identityNew: PropTypes.object,
    retrieveAttributes: PropTypes.func.isRequired,
    toggleEditField: PropTypes.func.isRequired,
    toggleQRScan: PropTypes.func.isRequired,
    saveAttribute: PropTypes.func.isRequired,
    enterField: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.retrieveAttributes({claims: ['phone', 'name', 'email']})
  }

  render() {
    return (
      <Presentation
        identityNew={this.props.identityNew}
        enterField={this.props.enterField}
        saveAttribute={this.props.saveAttribute}
        toggleEditField={this.props.toggleEditField}
        toggleQRScan={this.props.toggleQRScan}
      />
    )
  }
}