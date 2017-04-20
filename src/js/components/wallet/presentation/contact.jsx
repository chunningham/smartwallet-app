import React from 'react'
import Radium from 'radium'
import {
  EditAppBar,
  EditHeader,
  EditListItem,
  AddNew,
  TabContainer
} from './ui'
import {
  Content,
  Block
} from '../../structure'
import {theme} from 'styles'
import ContentMail from 'material-ui/svg-icons/content/mail'
import {
  List,
  CircularProgress
} from 'material-ui'

const STYLES = {
  title: {
    padding: '0 24px',
    color: theme.palette.textColor,
    fontWeight: '100'
  },
  titleDivider: {
    marginTop: '10px'
  },
  icon: {
    marginTop: '40px',
    marginRight: '40px'
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
}

@Radium
export default class WalletContact extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    focused: React.PropTypes.string.isRequired,
    onFocusChange: React.PropTypes.func.isRequired,
    information: React.PropTypes.object.isRequired,
    updateInformation: React.PropTypes.func.isRequired,
    deleteInformation: React.PropTypes.func.isRequired,
    setInformation: React.PropTypes.func.isRequired,
    exitWithoutSaving: React.PropTypes.func.isRequired,
    saveChanges: React.PropTypes.func.isRequired,
    loading: React.PropTypes.bool.isRequired,
    showErrors: React.PropTypes.bool,
    addNewEntry: React.PropTypes.func.isRequired,
    confirm: React.PropTypes.func.isRequired,
    close: React.PropTypes.func.isRequired
  }

  render() {
    if (this.props.loading === true) {
      return (
        <TabContainer>
          <EditAppBar title="Edit Contact"
            loading={this.props.loading}
            onSave={this.props.saveChanges}
            onClose={this.props.exitWithoutSaving} />
          <Content>
            <EditHeader title="Contact" />
            <List>
              <CircularProgress style={STYLES.spinner} />
            </List>
          </Content>
        </TabContainer>
      )
    }
    let emailFields = []
    // console.log(emailFields)
    if (this.props.loading === false) {
      emailFields.push(this.props.information.originalInformation.emails
      .map((email, i) => {
        if (!email.delete) {
          return (
            <Block key={'originalInformation' + 'emails' + i}>
              <EditListItem
                id={'originalInformation' + 'emails' + i}
                icon={ContentMail}
                iconStyle={STYLES.icon}
                textLabel="Email Address"
                textName="email"
                textValue={email.address}
                verified={email.verified}
                errorText={
                  this.props.showErrors &&
                  !email.valid ? 'Email not valid' : ''}
                focused={
                  this.props.focused === 'originalInformation' + 'emails' + i}
                onFocusChange={this.props.onFocusChange}
                onChange={
                 (e) => this.props.updateInformation('emails', i, e.target.value)} //eslint-disable-line
                onDelete={() => {
                  email.verified
                  ? this.props.confirm(
                    'Are you sure you want to delete a verified email?',
                    'Delete', () => {
                      this.props.deleteInformation('originalInformation',
                      'emails', i)
                      this.props.close()
                    })
                  : this.props.deleteInformation('originalInformation',
                  'emails', i)
                }}
                enableDelete
                />
            </Block>
          )
        }
      }
      ))
      emailFields.push(this.props.information.newInformation.emails
      .map((email, i) => {
        if (!email.delete) {
          return (
            <Block key={'newInformation' + 'emails' + i}>
              <EditListItem
                id={'newInformation' + 'emails' + i}
                icon={ContentMail}
                iconStyle={STYLES.icon}
                textLabel="Email Address"
                textName="email"
                textValue={email.address}
                verified={false}
                errorText={
                  this.props.showErrors &&
                  !email.valid &&
                  !email.blank ? 'Email not valid' : ''}
                focused={
                  this.props.focused === 'newInformation' + 'emails' + i}
                onFocusChange={this.props.onFocusChange}
                onChange={
                 (e) => this.props.setInformation(
                   'emails', i, e.target.value)}
                onDelete={() => {
                  this.props.deleteInformation('newInformation', 'emails', i)
                }}
                enableDelete={!email.blank}
                />
            </Block>
          )
        }
      }
    ))
      if (emailFields[0].length === 0 && emailFields[1].length === 0) {
        emailFields.push(
          <EditListItem
            id={'newInformation' + 'emails' + 0}
            icon={ContentMail}
            iconStyle={STYLES.icon}
            textLabel="Email Address"
            textName="email"
            textValue=""
            verified={false}
            focused={this.props.focused === 'newInformation' + 'emails' + 0}
            onFocusChange={() => {
              this.props.addNewEntry('emails')
              this.props.onFocusChange('newInformation' + 'emails' + 0)
            }}
            onChange={
             (e) => this.props.setInformation(
               'emails', 0, e.target.value)}
            onDelete={() => {
              this.props.deleteInformation('newInformation', 'emails', 0)
            }} />
        )
      } else {
        emailFields.push(
          <Block key="addEmailField">
            <AddNew onClick={() => {
              this._handleAddNewClick()
            }}
              value="Additional Email" />
          </Block>
        )
      }
    }

    // console.log(emailFields)
    return (
      <TabContainer>
        <EditAppBar title="Edit Contact"
          loading={this.props.loading}
          onSave={this.props.saveChanges}
          onClose={this.props.exitWithoutSaving} />
        <Content>
          <EditHeader title="Contact" />
          <List>
            {emailFields}
          </List>
        </Content>
      </TabContainer>
    )
  }
  _handleAddNewClick = () => {
    var length = this.props.information.newInformation.emails.length
    if (length === 0 ||
      this.props.information.newInformation.emails[length - 1].address !==
         '') {
      this.props.addNewEntry('emails')
      this.props.onFocusChange(
        'newInformation' + 'emails' +
         this.props.information.newInformation.emails.length)
    }
  }
}
