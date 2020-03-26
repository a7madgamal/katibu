/** @jsx jsx */

import { css, jsx } from '@emotion/core'
import styled from '@emotion/styled'

const BadgeStyle = css`
  font-family: monospace;
  cursor: default;
  display: inline-flex;
  margin: 3px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 4px;
  padding-right: 4px;
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
  color: whitesmoke;
  box-shadow: 0px 0px 1px #fff;

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
  font-size: 13px;
  margin-bottom: 2px;
  color: ${textColor};
`

const SupportLink = styled.span`
  margin-left: 10px;
  display: inline;
  cursor: pointer;
  font-size: 13px;
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
}
