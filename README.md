# katibu
- The ultimate tool for the super-lazy, 10x, extremly busy agile developer.
- Connect Jira, git, Github in one place. How? check the table to know what you're missing 😱

![image](https://user-images.githubusercontent.com/939602/77831758-ebfbce00-7128-11ea-9034-7d34572e4d15.png)

| before katibu 🐢 | after katibu 🚀|
| :-----------: | :-----------: |
| Someone creates a Jira ticket, you only know if he send it or assigns it to you (and you didn't miss the useless email notification) | katibu sends a notification that you can click to open the ticket. You can configure it to track tickets you wouldn't otherwise get an email. that ticket is one shortcut away just click the label  |
| you open the ticket and change status to something like `in progress`  | you get a notification if it was just added, then with every status change, as always click to open it |
| you checkout master, pull, create a new local branch with the ticket number and title | with a single click, katibu creates a new branch based on latest master with the prefect git-friendly name based on the ticket key and title. very easy to create the same branch on different repos (soon: click it to open vscode) |
| commit and push, usually many times | single click on the UP arrow to push (optionally with no-verify or force) |
| you need to open a PR. so you open githup, find the repo and then hope to see the shortcut for newly pushed branch to open a PR you need to fix the title and finally open the PR | single click on the github icon to open the current PR page OR a new PR page with a the perfect title (even if you push a single commit only ;) |
| there are checks and they take LONG time and focus, you have to wait for approvals before having a mergable PR. | you get a notification when your PRs status change (blocked or unblocked). |
| you FINALLY merge the damn PR, you delete the remote branch, switch to master, remove the local branch, you fail, you try again with force and only then you are finally done with this ticket! | katibu tracks any changes to remote branches, when a remote branch is deleted you get a notification to delete the local branch, you click it and it's gone (and another one if force is needed) and BOOM! you're on updated master again ready to roll.|

## download (still alpha, please report any issues)
- macos: https://github.com/a7madgamal/katibu/releases

## development
- run `yarn` then `yarn start` to test drive it. 

## so, what does katibu means?
- it means `secretary` in swahili. I'm actually from Egypt but I liked the word 🤷🏻‍♂️

