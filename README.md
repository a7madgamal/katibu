# katibu
- The ultimate tool for the super-lazy, 10x, extremly busy agile developer.
- Connect Jira, git, Github in one place. How? check the table to know what you're missing 😱

![image](https://user-images.githubusercontent.com/939602/77268139-e0c61f80-6c9c-11ea-817d-4264e5564ae2.png)


| before katibu 🐢 | after katibu 🚀|
| :-----------: | :-----------: |
| Someone creates a Jira ticket, you only know if he send it or assigns it to you (and you didn't miss the useless email notification) | katibu sends a notification that you can click to open the ticket. You can configure it to track tickets you wouldn't otherwise get an email. that ticket is one shortcut away just click the label  |
| you open the ticket and change status to something like `in progress`  | you get a notification if it was just added, then with every status change, as always click to open it |
| you checkout master, pull, create a new local branch with the ticket number and title | with a single click, katibu creates a new branch based on latest master with the prefect git-friendly name based on the ticket key and title. very easy to create the same branch on different repos (soon: click it to open vscode) |
| commit and push, usually many times | a global shortcut to push, push with no-verify or force-push the currently checked-out branch in any of your tracked repos |
| you need to open a PR. so you open githup, find the repo and then hope to see the shortcut for newly pushed branch to open a PR you need to fix the title and finally open the PR | with every push you get a notification that you can click to open the PR page with a clean title |
| there are checks and they take LONG time and focus, you have to wait for approvals before having a mergable PR. | you get a notification when your PRs are blocked or unblocked that you can click to open the PR. katibu keeps all your tracked PRs updated with master too |
| you FINALLY merge the damn PR, you delete the remote branch, switch to master, remove the local branch, you fail, you try again with force and only then you are finally done with this ticket! | katibu tracks any changes to remote branches, when a remote branch is deleted you get a notification to delete the local branch, you click it and it's gone (and another one if force is needed) and BOOM! you're on updated master again ready to roll.|


# very early alpha, macos build and better help coming soon. for now just run `yarn` then `yarn start` to test drive it. 

feel free to reach out about issues or suggestions.

## so, what does katibu means?
- it means `secretary` in swahili. I'm actually from Egypt but I liked the word 🤷🏻‍♂️

