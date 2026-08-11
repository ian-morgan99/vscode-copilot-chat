/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter } from '../../../util/vs/base/common/event';
import { Disposable } from '../../../util/vs/base/common/lifecycle';
import { CopilotToken, createTestExtendedTokenInfo } from '../common/copilotToken';
import { ICopilotTokenManager } from '../common/copilotTokenManager';

/**
 * Copilot token manager for offline mode.
 * Provides mock tokens that don't require GitHub or cloud connectivity.
 */
export class OfflineCopilotTokenManager extends Disposable implements ICopilotTokenManager {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidCopilotTokenRefresh = this._register(new Emitter<void>());
	readonly onDidCopilotTokenRefresh = this._onDidCopilotTokenRefresh.event;

	private _token: CopilotToken | undefined;

	constructor() {
		super();
		this._initialize();
	}

	private _initialize(): void {
		// Initialize with a mock token that has all required properties
		const mockTokenInfo = createTestExtendedTokenInfo({
			token: 'tid=offline;sku=no_auth_limited_copilot;chat=1;ignore=1;nes=1;ccr=1;editor_preview_features=1:offline',
			copilotignore_enabled: true,
			telemetry: 'disabled',
			public_suggestions: 'disabled',
			individual: true,
			sku: 'no_auth_limited_copilot',
			copilot_plan: 'free',
			username: 'offline-user',
			blackbird_clientside_indexing: false,
		});
		this._token = new CopilotToken(mockTokenInfo);
	}

	async getCopilotToken(force?: boolean): Promise<CopilotToken> {
		if (!this._token || force) {
			this._initialize();
		}
		return this._token!;
	}

	resetCopilotToken(httpError?: number): void {
		// No-op in offline mode
	}

	async refreshToken(): Promise<CopilotToken> {
		// In offline mode, we just regenerate a mock token
		this._initialize();
		this._onDidCopilotTokenRefresh.fire();
		return this._token!;
	}
}

/**
 * Creates an offline copilot token manager instance.
 */
export function createOfflineCopilotTokenManager(): ICopilotTokenManager {
	return new OfflineCopilotTokenManager();
}
