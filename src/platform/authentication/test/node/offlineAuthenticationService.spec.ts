/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import { MinimalModeError } from '../../common/authentication';
import { OfflineAuthenticationService } from '../../node/offlineAuthenticationService';
import { OfflineCopilotTokenManager } from '../../node/offlineCopilotTokenManager';

describe('OfflineAuthenticationService', () => {
	function createService(): OfflineAuthenticationService {
		return new OfflineAuthenticationService(new OfflineCopilotTokenManager(), undefined);
	}

	it('never exposes fabricated GitHub credentials', async () => {
		const service = createService();

		expect(service.isMinimalMode).toBe(true);
		expect(service.anyGitHubSession).toBeUndefined();
		expect(service.permissiveGitHubSession).toBeUndefined();
		await expect(service.getGitHubSession('any', { silent: true })).resolves.toBeUndefined();
		await expect(service.getGitHubSession('permissive', { silent: true })).resolves.toBeUndefined();
		await expect(service.getAnyGitHubToken()).resolves.toBeUndefined();
		await expect(service.getPermissiveGitHubToken()).resolves.toBeUndefined();
	});

	it('fails closed when GitHub authentication is requested interactively', async () => {
		const service = createService();

		await expect(service.getGitHubSession('any', { createIfNone: { detail: 'test' } }))
			.rejects.toThrow('GitHub authentication is unavailable in offline mode.');
		await expect(service.getGitHubSession('permissive', { createIfNone: { detail: 'test' } }))
			.rejects.toBeInstanceOf(MinimalModeError);
	});

	it('provides a local-only token with telemetry disabled', async () => {
		const service = createService();
		const token = await service.getCopilotToken();

		expect(token.username).toBe('offline-user');
		expect(token.isTelemetryEnabled()).toBe(false);
		expect(token.isPublicSuggestionsEnabled()).toBe(false);
	});
});
