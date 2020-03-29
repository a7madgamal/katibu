/** @jsx jsx */

import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { saveSettings } from '../../store/settings/actions'
import { Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { FieldArray } from 'react-final-form-arrays'
import { TAppState } from '../../store'
import { jsx } from '@emotion/core'
import css from '@emotion/css'
import { shell, ipcRenderer } from 'electron'
import { folderPicker } from '../../plugins/dialogs'
import { RepoRemote } from '../../plugins/git'
import {
  TextFieldWrapper,
  Error,
  Label,
  SupportLink,
  textColor,
} from '../components/styles'
import { IPC_GET_GIT_REMOTE } from '../../constants'

const mapState = (state: TAppState) => ({
  settings: state.settings,
})

const mapDispatch = {
  saveSettingsAction: saveSettings,
}

const connector = connect(mapState, mapDispatch)

type TProps = ConnectedProps<typeof connector>

const settings: React.FC<TProps> = ({ settings, saveSettingsAction }) => (
  <div
    css={css`
      padding: 10px;
      color: white;
    `}
  >
    <Link
      to="/"
      css={css`
        position: fixed;
        color: white;
        right: 20px;
      `}
    >
      x
    </Link>
    <Form
      initialValues={settings}
      onSubmit={(values) => {
        saveSettingsAction(values)
      }}
      mutators={{
        ...arrayMutators,
      }}
      validate={(values) => {
        const errors: any = {}
        // if (!values.port) {
        //   errors.port = 'Required'
        // }
        if (!values.githubAuth) {
          errors.githubAuth = 'Required'
        }
        if (!values.githubUserName) {
          errors.githubUserName = 'Required'
        }
        if (!values.jiraHost) {
          errors.jiraHost = 'Required'
        }
        if (!values.jiraJQL) {
          errors.jiraJQL = 'Required'
        }
        if (!values.jiraEmail) {
          errors.jiraEmail = 'Required'
        }
        if (!values.jiraAuth) {
          errors.jiraAuth = 'Required'
        }

        if (values.reposList && values.reposList.length > 0) {
          for (let i = 0; i < values.reposList.length; i++) {
            const repo = values.reposList[i]
            if (!repo.path) {
              errors[`reposList[${i}].path`] = 'Required'
            }
            if (!repo.repoId) {
              errors[`reposList[${i}].repoId`] = 'Required'
            }
            if (!repo.remoteName) {
              errors[`reposList[${i}].remoteName`] = 'Required'
            }
            if (!repo.orgID) {
              errors[`reposList[${i}].orgID`] = 'Required'
            }
          }
        }
        return errors
      }}
      render={({ handleSubmit, pristine, invalid, form }) => (
        <form
          onSubmit={handleSubmit}
          css={css`
            margin: auto;
            width: fit-content;
          `}
        >
          <h1
            css={css`
              margin: 0;
              color: ${textColor};
            `}
          >
            Settings:
          </h1>
          <Field name="githubUserName">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <Label>github username:</Label>
                <input
                  {...input}
                  css={css`
                    width: 150px;
                  `}
                  type="text"
                  placeholder="a7madgamal"
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="githubAuth">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <Label>
                  github auth:
                  <SupportLink
                    onClick={() =>
                      shell.openExternal('https://github.com/settings/tokens')
                    }
                  >
                    generate
                  </SupportLink>
                </Label>

                <input
                  {...input}
                  css={css`
                    width: 300px;
                  `}
                  type="text"
                  placeholder=""
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>
          <Field name="jiraHost">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <Label>Jira host:</Label>
                <input
                  {...input}
                  css={css`
                    width: 200px;
                  `}
                  type="text"
                  placeholder="xxx.atlassian.net"
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>
          <Field name="jiraEmail">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <Label>Jira Email:</Label>
                <input
                  {...input}
                  css={css`
                    width: 200px;
                  `}
                  type="text"
                  placeholder="you@yourLoginEmailForJira.com"
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="jiraAuth">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <Label>
                  Jira Auth:
                  <SupportLink
                    onClick={() =>
                      shell.openExternal(
                        'https://id.atlassian.com/manage/api-tokens',
                      )
                    }
                  >
                    generate
                  </SupportLink>
                </Label>
                <input
                  {...input}
                  css={css`
                    width: 300px;
                  `}
                  type="text"
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="jiraJQL">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <Label>
                  Jira JQL query:
                  <SupportLink
                    onClick={() =>
                      shell.openExternal(
                        'https://www.atlassian.com/software/jira/guides/expand-jira/jql',
                      )
                    }
                  >
                    learn more
                  </SupportLink>
                </Label>
                <input
                  {...input}
                  css={css`
                    width: 500px;
                  `}
                  type="text"
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <h1
            css={css`
              margin: 0;
              color: ${textColor};
            `}
          >
            repos:
            <button
              css={css`
                margin-left: 20px;
              `}
              type="button"
              onClick={async () => {
                const folder = await folderPicker()

                if (!folder.canceled) {
                  const path = folder.filePaths[0]

                  const remote: RepoRemote | false = ipcRenderer.sendSync(
                    IPC_GET_GIT_REMOTE,
                    path,
                  )

                  if (remote) {
                    form.mutators.push('reposList', {
                      path,
                      orgID: remote.orgID,
                      remoteName: remote.remoteName,
                      repoId: remote.repoId,
                      enableAutoRefresh: true,
                    })
                  } else {
                    alert("couldn't get git remote details")
                  }
                }
              }}
            >
              Add a local repo
            </button>
          </h1>

          <FieldArray name="reposList">
            {({ fields }) =>
              fields.map((fieldKey, index) => (
                <div
                  key={fieldKey}
                  css={css`
                    position: relative;
                    margin: 5px;
                    border: 1px solid #ddd;
                    padding: 5px;
                  `}
                >
                  <span
                    onClick={() => fields.remove(index)}
                    css={css`
                      cursor: pointer;
                      position: absolute;
                      right: 0;
                      top: 0;
                    `}
                  >
                    ❌
                  </span>
                  <Field name={`${fieldKey}.path`}>
                    {({ input, meta }) => (
                      <TextFieldWrapper>
                        <Label>Path:</Label>
                        <input {...input} disabled={true} type="text" />

                        {meta.error && meta.touched && (
                          <Error>{meta.error}</Error>
                        )}
                      </TextFieldWrapper>
                    )}
                  </Field>

                  <Field name={`${fieldKey}.orgID`}>
                    {({ input, meta }) => (
                      <span
                        css={css`
                          margin-left: 10px;
                        `}
                      >
                        <Label>owner:</Label>
                        <input
                          {...input}
                          disabled={true}
                          css={css`
                            width: 100px;
                            background-color: gray;
                            border: 0;
                          `}
                          type="text"
                        />

                        {meta.error && meta.touched && (
                          <Error>{meta.error}</Error>
                        )}
                      </span>
                    )}
                  </Field>

                  <Field name={`${fieldKey}.repoId`}>
                    {({ input, meta }) => (
                      <span>
                        <Label>repo:</Label>
                        <input
                          {...input}
                          disabled={true}
                          css={css`
                            width: 100px;
                            background-color: gray;
                            border: 0;
                          `}
                          type="text"
                        />

                        {meta.error && meta.touched && (
                          <Error>{meta.error}</Error>
                        )}
                      </span>
                    )}
                  </Field>

                  <Field name={`${fieldKey}.remoteName`}>
                    {({ input, meta }) => (
                      <span>
                        <Label>remote:</Label>
                        <input
                          {...input}
                          disabled={true}
                          css={css`
                            width: 40px;
                            background-color: gray;
                            border: 0;
                          `}
                          type="text"
                        />

                        {meta.error && meta.touched && (
                          <Error>{meta.error}</Error>
                        )}
                      </span>
                    )}
                  </Field>

                  <Field name={`${fieldKey}.enableAutoRefresh`}>
                    {({ input }) => {
                      return (
                        <div>
                          <input
                            {...input}
                            {...(input.value ? { checked: true } : {})}
                            css={css`
                              display: inline;
                            `}
                            type="checkbox"
                          />
                          <Label
                            css={css`
                              display: inline;
                            `}
                          >
                            enable auto-refresh
                          </Label>
                        </div>
                      )
                    }}
                  </Field>
                </div>
              ))
            }
          </FieldArray>

          <button
            type="submit"
            disabled={pristine || invalid}
            css={css`
              margin-top: 20px;
              font-size: 18px;
            `}
          >
            Save
          </button>
        </form>
      )}
    />
  </div>
)

const Settings = connector(settings)

export { Settings }
