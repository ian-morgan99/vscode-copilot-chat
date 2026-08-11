/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LanguageModelChat, type ChatRequest } from 'vscode';
import { ChatEndpointFamily, EmbeddingsEndpointFamily, ICompletionModelInformation, IEndpointProvider } from '../../../platform/endpoint/common/endpointProvider';
import { ExtensionContributedChatEndpoint } from '../../../platform/endpoint/vscode-node/extChatEndpoint';
import { IChatEndpoint, IEmbeddingsEndpoint } from '../../../platform/networking/common/networking';
import { Event } from '../../../util/vs/base/common/event';
import { IInstantiationService } from '../../../util/vs/platform/instantiation/common/instantiation';

/**
 * Endpoint provider used by the development-only offline mode.
 *
 * Copilot model metadata and embeddings are cloud services. Returning invented
 * metadata for them makes the UI advertise models that cannot handle requests,
 * and can cause a synthetic token to be sent to GitHub. Offline mode therefore
 * exposes only models contributed by local/BYOK providers.
 */
export class OfflineEndpointProvider implements IEndpointProvider {
	declare readonly _serviceBrand: undefined;

	readonly onDidModelsRefresh = Event.None;

	constructor(
		@IInstantiationService private readonly _instantiationService: IInstantiationService,
	) { }

	async getAllCompletionModels(_forceRefresh?: boolean): Promise<ICompletionModelInformation[]> {
		return [];
	}

	async getAllChatEndpoints(): Promise<IChatEndpoint[]> {
		return [];
	}

	async getChatEndpoint(requestOrFamilyOrModel: LanguageModelChat | ChatRequest | ChatEndpointFamily): Promise<IChatEndpoint> {
		if (typeof requestOrFamilyOrModel !== 'string') {
			const model = 'model' in requestOrFamilyOrModel ? requestOrFamilyOrModel.model : requestOrFamilyOrModel;
			if (model && model.vendor !== 'copilot') {
				return this._instantiationService.createInstance(ExtensionContributedChatEndpoint, model);
			}
		}
		throw new Error('GitHub Copilot cloud models are unavailable in offline mode. Select a local or BYOK model.');
	}

	async getEmbeddingsEndpoint(_family?: EmbeddingsEndpointFamily): Promise<IEmbeddingsEndpoint> {
		throw new Error('GitHub Copilot embeddings are unavailable in offline mode.');
	}
}
