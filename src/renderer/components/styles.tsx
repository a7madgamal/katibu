/** @jsx jsx */

import { css } from '@emotion/core'
import styled from '@emotion/styled'

const titlesColor = '#fff'
const ticketInProgressBGColor = '#0052cc'
const ticketInProgressColor = '#fff'
const ticketInactiveBGColor = '#999'
const ticketInactiveColor = '#000'
const actionsColor = '#333'
const cardsBGColor = '#ddd'
const activeCardAccentColor = '#00cc00'
// const remoteCardColor = ''
// const remoteCardBGColor = ''
const borderColor = '#bfbfbf'

const BadgeStyle = css`
  cursor: default;
  display: inline-flex;
  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  border-radius: 4px;
  width: fit-content;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-grow: 0;
`
const ClickableBadgeStyle = css`
  transition: 0.3s;
  cursor: pointer;
  color: ${actionsColor};
  box-shadow: 0px 0px 1px #fff;
  margin-left: 3px;

  :hover {
    box-shadow: 1px 1px 1px #fff;
  }
`

const TextFieldWrapper = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  margin: 10px;
`
const Error = styled.span`
  color: red;
`

const textColor = '#cacaca'
const settingLinkColor = '#8bc34a'

const Label = styled.label`
  font-size: 18px;
  margin-bottom: 2px;
  color: ${textColor};
`

const SupportLink = styled.span`
  margin-left: 10px;
  display: inline;
  cursor: pointer;
  font-size: 18px;
  color: ${settingLinkColor};

  :hover {
    color: white;
  }
`

export {
  BadgeStyle,
  ClickableBadgeStyle,
  TextFieldWrapper,
  Error,
  Label,
  SupportLink,
  textColor,
  settingLinkColor,
  titlesColor,
  ticketInProgressColor,
  ticketInProgressBGColor,
  ticketInactiveColor,
  actionsColor,
  cardsBGColor,
  activeCardAccentColor,
  // remoteCardColor,
  // remoteCardBGColor,
  borderColor,
  ticketInactiveBGColor,
}
