/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const packageLockPath = path.join(repoRoot, 'package-lock.json');

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
	fs.writeFileSync(filePath, JSON.stringify(value, null, '\t') + '\n');
}

function bumpPatch(version) {
	const match = /^(\d+)\.(\d+)\.(\d+)(-.+)?$/.exec(version);
	if (!match) {
		throw new Error(`Cannot bump unsupported version format: ${version}`);
	}

	const [, major, minor, patch, prerelease = ''] = match;
	return `${major}.${minor}.${Number(patch) + 1}${prerelease}`;
}

const pkg = readJson(packageJsonPath);
const nextVersion = bumpPatch(pkg.version);
pkg.version = nextVersion;
writeJson(packageJsonPath, pkg);

if (fs.existsSync(packageLockPath)) {
	const lock = readJson(packageLockPath);
	lock.version = nextVersion;
	if (lock.packages?.['']) {
		lock.packages[''].version = nextVersion;
	}
	writeJson(packageLockPath, lock);
}

console.log(`Bumped extension version to ${nextVersion}`);
