![Release](https://github.com/a7madgamal/katibu/workflows/Release/badge.svg?branch=master)

# katibu

- The ultimate tool for the super-lazy, 10x, extremly busy agile developer.
- Connect Jira, git, Github in one place. How? check the table to know what you're missing 😱

## شرح للبرنامج باللغة العربية

https://youtu.be/FXFyHAY3Br0

![image](https://user-images.githubusercontent.com/939602/77838115-449a8d80-7160-11ea-8fc1-38db1e777dfb.png)

|                                                                                         before katibu 🐢                                                                                          |                                                                                            after katibu 🚀                                                                                             |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                          Someone creates a Jira ticket, you only know if he send it or assigns it to you                                                          |                                   katibu sends a notification that you can click to open the ticket. You can also open it by clicking on the ticket label in the UI                                    |
|                                                       you checkout master, pull, create a new local branch with the ticket number and title                                                       |                      you click a button and katibu creates a new branch from latest master with the prefect git-friendly name. click the branch name to open this repo in vscode                       |
|                                                                                commit and push, usually many times                                                                                |                                                                   click on the UP arrow to push (optionally with no-verify or force)                                                                   |
|                                                    you need to open a PR. you open githup, find the repo, you type the PR title and click open                                                    |                                click on the github icon to open the current PR page OR a new PR page with a the perfect title, even if you push a single commit only ;)                                |
| there are checks and they take LONG time and focus, then you have to wait for approvals before having a mergable PR. Oh no, master changed and you need to update your PR and run checks again 😡 |                                               you get a notification when a new related PR is detected or when the status change (blocked or unblocked).                                               |
|            you FINALLY merge your PR, you delete the remote branch, switch to master, remove the local branch (or worse, you dont!). wait, deleting failed so you try again with force            | when a remote branch is deleted you get a notification to delete the local branch, you click it and it's gone (another one if force is needed) and BOOM! you're on updated master again ready to roll. |

# IMPORTANT: because I can't sign my app (I need to pay Apple \$100 yearly 🤦🏻‍♂️) you need to do this:

- download the latest version
- extract, move the app to your applications folder
- open the applications folder, right click the file `katibu`, press `option` key then click `open`, in the dialog you should be able to run, if not try again. this is needed only once after fresh downloads.

## download (still beta, please report any issues)

- https://github.com/a7madgamal/katibu/releases

## development

- run `yarn` then `yarn start` to test drive it.

## so, what does katibu means?

- it means `secretary` in swahili. I'm actually from Egypt but I liked the word 🤷🏻‍♂️
