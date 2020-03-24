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
import { shell } from 'electron'
import { folderPicker } from '../../plugins/dialogs'
import { getRepoFromPath, getRemote } from '../../plugins/git'
import { TextFieldWrapper, Error } from '../components/styles'

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
        padding: 10px;
        color: white;
        position: absolute;
        right: 20px;
      `}
    >
      x
    </Link>
    <Form
      initialValues={settings}
      onSubmit={values => {
        saveSettingsAction(values)
      }}
      mutators={{
        ...arrayMutators,
      }}
      validate={values => {
        const errors: any = {}
        if (!values.port) {
          errors.port = 'Required'
        }
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
        <form onSubmit={handleSubmit}>
          <h2>Settings:</h2>

          <Field name="port">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Server Port:</label>
                <input
                  {...input}
                  type="text"
                  placeholder="3456"
                  css={css`
                    width: 60px;
                  `}
                />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="githubUserName">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Github Username:</label>
                <input {...input} type="text" />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="githubAuth">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Github auth:</label>
                <input {...input} type="text" />
                <span
                  onClick={() =>
                    shell.openExternal('https://github.com/settings/tokens')
                  }
                >
                  https://github.com/settings/tokens
                </span>

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="jiraHost">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Jira host: (xxx.atlassian.net)</label>
                <input {...input} type="text" />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="jiraEmail">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Jira Email:</label>
                <input {...input} type="text" />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="jiraJQL">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Jira JQL query:</label>
                <input {...input} type="text" />

                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <Field name="jiraAuth">
            {({ input, meta }) => (
              <TextFieldWrapper>
                <label>Jira Auth: </label>
                <input {...input} type="text" />

                <span
                  onClick={() =>
                    shell.openExternal(
                      'https://id.atlassian.com/manage/api-tokens',
                    )
                  }
                >
                  https://id.atlassian.com/manage/api-tokens
                </span>
                {meta.error && meta.touched && <Error>{meta.error}</Error>}
              </TextFieldWrapper>
            )}
          </Field>

          <h2>
            Repos
            <button
              type="button"
              onClick={async () => {
                const folder = await folderPicker()
                if (!folder.canceled) {
                  const path = folder.filePaths[0]
                  const gitRepo = await getRepoFromPath(path)
                  if (gitRepo) {
                    const remote = await getRemote(gitRepo)
                    if (remote) {
                      form.mutators.push('reposList', {
                        path,
                        orgID: remote.orgID,
                        remoteName: remote.remoteName,
                        repoId: remote.repoId,
                      })
                    } else {
                      alert("couldn't get git remote details")
                    }
                  } else {
                    alert('not a git repo')
                  }
                }
              }}
            >
              +
            </button>
          </h2>
          <FieldArray name="reposList">
            {({ fields }) =>
              fields.map((fieldKey, index) => (
                <div
                  key={fieldKey}
                  css={css`
                    margin: 5px;
                    border: 1px solid #ddd;
                    padding: 5px;
                  `}
                >
                  <Field
                    disabled={true}
                    name={`${fieldKey}.path`}
                    component="input"
                    placeholder="/abs/repo/path"
                    css={css`
                      width: 400px;
                    `}
                  />
                  <br />

                  <Field
                    disabled={true}
                    name={`${fieldKey}.orgID`}
                    component="input"
                    placeholder="owner or orgID"
                    css={css`
                      width: 100px;
                    `}
                  />
                  <br />

                  <Field
                    disabled={true}
                    name={`${fieldKey}.repoId`}
                    component="input"
                    placeholder="repo ID"
                    css={css`
                      width: 200px;
                    `}
                  />
                  <br />
                  <Field
                    disabled={true}
                    name={`${fieldKey}.remoteName`}
                    component="input"
                    placeholder="remote name"
                    css={css`
                      width: 100px;
                    `}
                  />
                  <br />

                  <label htmlFor={`${fieldKey}.shouldMonitor`}>
                    should Monitor
                  </label>

                  <Field
                    name={`${fieldKey}.shouldMonitor`}
                    id={`${fieldKey}.shouldMonitor`}
                    type="checkbox"
                    component="input"
                  />

                  <span
                    onClick={() => fields.remove(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    ❌
                  </span>
                </div>
              ))
            }
          </FieldArray>
          <button type="submit" disabled={pristine || invalid}>
            Save
          </button>
        </form>
      )}
    />
  </div>
)

const Settings = connector(settings)

export { Settings }
