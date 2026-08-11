/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it, vi } from 'vitest';
import type { LanguageModelChat } from 'vscode';
import { IInstantiationService } from '../../../util/vs/platform/instantiation/common/instantiation';
import { OfflineEndpointProvider } from './offlineEndpointProvider';

describe('OfflineEndpointProvider', () => {
	function createProvider() {
		const instantiationService = {
			createInstance: vi.fn().mockReturnValue({ model: 'local-model' }),
		} as unknown as IInstantiationService;
		return { provider: new OfflineEndpointProvider(instantiationService), instantiationService };
	}

	it('does not advertise cloud models or completion models', async () => {
		const { provider } = createProvider();

		await expect(provider.getAllChatEndpoints()).resolves.toEqual([]);
		await expect(provider.getAllCompletionModels()).resolves.toEqual([]);
		await expect(provider.getEmbeddingsEndpoint()).rejects.toThrow('unavailable in offline mode');
	});

	it('fails closed for Copilot models', async () => {
		const { provider, instantiationService } = createProvider();
		const model = { id: 'gpt', vendor: 'copilot' } as LanguageModelChat;

		await expect(provider.getChatEndpoint(model)).rejects.toThrow('Select a local or BYOK model');
		expect(instantiationService.createInstance).not.toHaveBeenCalled();
	});

	it('allows extension-contributed local models', async () => {
		const { provider, instantiationService } = createProvider();
		const model = { id: 'local-model', vendor: 'local-provider' } as LanguageModelChat;

		await expect(provider.getChatEndpoint(model)).resolves.toEqual({ model: 'local-model' });
		expect(instantiationService.createInstance).toHaveBeenCalledOnce();
	});
});
