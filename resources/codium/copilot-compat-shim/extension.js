/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const vscode = require('vscode');

function activate(context) {
	const registerIfMissing = async (command, callback) => {
		const commands = await vscode.commands.getCommands(true);
		if (!commands.includes(command)) {
			context.subscriptions.push(vscode.commands.registerCommand(command, callback));
		}
	};

	const forwardToChat = async (command, ...args) => {
		try {
			await vscode.commands.executeCommand(command, ...args);
		} catch {
			// The chat extension owns real authentication. This shim only satisfies
			// VSCodium's baked-in GitHub.copilot product dependency.
		}
	};

	void registerIfMissing('github.copilot.signIn', () => forwardToChat('github.copilot.refreshToken'));
	void registerIfMissing('github.copilot.refreshToken', () => forwardToChat('github.copilot.chat.openModelPicker'));
	void registerIfMissing('github.copilot.open.walkthrough', () => forwardToChat('github.copilot.chat.openModelPicker'));
	void registerIfMissing('github.copilot.git.generateCommitMessage', async () => {
		await vscode.window.showInformationMessage('Git commit message generation is provided by GitHub Copilot Chat.');
	});
	void registerIfMissing('github.copilot.git.resolveMergeConflicts', async () => {
		await vscode.window.showInformationMessage('Merge conflict resolution is provided by GitHub Copilot Chat.');
	});
	void registerIfMissing('github.copilot.toggleStatusMenu', async () => {
		await forwardToChat('github.copilot.chat.toggleStatusMenu');
	});
}

function deactivate() { }

module.exports = { activate, deactivate };
