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

export { BadgeStyle, ClickableBadgeStyle, TextFieldWrapper, Error }
