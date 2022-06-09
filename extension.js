const vscode = require('vscode');

// This extensions automatically generates header out of selected text.
// A generated header looks like this, for example:
//
// /* ============================== */
// /* ========= Header PogU ======== */
// /* ============================== */
//

/**
 * Returns the longest line of the currently active document.
 */
 function getLongestLine() {
	const lines = vscode.window.activeTextEditor?.document.getText().split('\n');
	if (!lines) return 0;
	return lines.reduce((acc, val) => val.trim().length > acc ? val.length : acc, -1);
}

/**
 * Generates the string value of the full header, taking into account the value  
 * it should display and the maximum length the header should span.
 */
 function makeHeader(value, maxlen) {
	// load options from extension configuration
	const configuration = vscode.workspace.getConfiguration('heading-creator');
	const fillCharacter = configuration.get('fillCharacter').slice(0, 1);
	const minimumBorderSize = configuration.get('minimumBorderSize');
	const commentDelimiterBegin = configuration.get('commentBegin');
	const commentDelimiterEnd = configuration.get('commentEnd');

	const textLength = value.length + 2; // + 2 for spaces before and after the title
	
	// fill character amount on each side of the heading text
	let fillCharacterAmount = (maxlen - textLength - commentDelimiterBegin.length - commentDelimiterEnd.length) / 2;
	if (fillCharacterAmount < minimumBorderSize) {
		fillCharacterAmount = minimumBorderSize;
	}

	const headerBorder = `${commentDelimiterBegin}${fillCharacter.repeat(fillCharacterAmount * 2 + textLength)}${commentDelimiterEnd}`;
	
	const headerLineLeft = fillCharacter.repeat(Math.ceil(fillCharacterAmount));
	const headerLineRight = fillCharacter.repeat(Math.floor(fillCharacterAmount));
	const headerLine = `${commentDelimiterBegin}${headerLineLeft} ${value} ${headerLineRight}${commentDelimiterEnd}`;

	return  [headerBorder, headerLine, headerBorder].join('\n'); // `${headerBorder}\n${headerLine}\n${headerBorder}`;
}

/**
 * Called when the extension is created.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('heading-creator.createHeading', function () {

		// make an edit
		vscode.window.activeTextEditor?.edit((selectedText) => {
			if (!vscode.window.activeTextEditor) return;

			// get current selection text and generate header string accordingly
			const currentSelectionText = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection);
			const headerString = makeHeader(currentSelectionText, getLongestLine());

			// replace current selection with the generated header string
			selectedText.replace(vscode.window.activeTextEditor.selection, headerString);
		});
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
