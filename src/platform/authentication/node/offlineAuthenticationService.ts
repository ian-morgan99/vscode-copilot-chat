/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { AuthenticationGetSessionOptions, AuthenticationSession } from 'vscode';
import { Emitter } from '../../../util/vs/base/common/event';
import { Disposable } from '../../../util/vs/base/common/lifecycle';
import { ILogService } from '../../log/common/logService';
import { IAuthenticationService, MinimalModeError, StrictAuthenticationPresentationOptions } from '../common/authentication';
import { CopilotToken } from '../common/copilotToken';
import { ICopilotTokenManager } from '../common/copilotTokenManager';

/**
 * Authentication service for offline mode.
 * Provides mock authentication that doesn't require GitHub or cloud connectivity.
 */
export class OfflineAuthenticationService extends Disposable implements IAuthenticationService {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidAuthenticationChange = this._register(new Emitter<void>());
	readonly onDidAuthenticationChange = this._onDidAuthenticationChange.event;

	private readonly _onDidAccessTokenChange = this._register(new Emitter<void>());
	readonly onDidAccessTokenChange = this._onDidAccessTokenChange.event;

	private readonly _onDidAdoAuthenticationChange = this._register(new Emitter<void>());
	readonly onDidAdoAuthenticationChange = this._onDidAdoAuthenticationChange.event;

	private _copilotToken: CopilotToken | undefined;

	public readonly isMinimalMode = true;

	constructor(
		@ICopilotTokenManager private readonly _copilotTokenManager: ICopilotTokenManager,
		@ILogService private readonly _logService?: ILogService,
	) {
		super();
		this._initialize();
	}

	private async _initialize(): Promise<void> {
		try {
			// The synthetic Copilot token unlocks local/BYOK providers only. Never
			// fabricate a GitHub session: callers could otherwise send the fake
			// access token to GitHub or assume repository write permission.
			this._copilotToken = await this._copilotTokenManager.getCopilotToken();

			this._logService?.info?.('Offline authentication service initialized');
			this._onDidAuthenticationChange.fire();
		} catch (error) {
			this._logService?.error?.(error, 'Failed to initialize offline authentication');
		}
	}

	get anyGitHubSession(): AuthenticationSession | undefined {
		return undefined;
	}

	get permissiveGitHubSession(): AuthenticationSession | undefined {
		return undefined;
	}

	get copilotToken(): CopilotToken | undefined {
		return this._copilotToken;
	}

	getGitHubSession(kind: 'permissive' | 'any', options: AuthenticationGetSessionOptions & { createIfNone: StrictAuthenticationPresentationOptions }): Promise<AuthenticationSession>;
	getGitHubSession(kind: 'permissive' | 'any', options: AuthenticationGetSessionOptions & { forceNewSession: StrictAuthenticationPresentationOptions }): Promise<AuthenticationSession>;
	getGitHubSession(kind: 'permissive' | 'any', options: Omit<AuthenticationGetSessionOptions, 'createIfNone' | 'forceNewSession'>): Promise<AuthenticationSession | undefined>;
	async getGitHubSession(
		kind: 'permissive' | 'any',
		_options: AuthenticationGetSessionOptions
	): Promise<AuthenticationSession | undefined> {
		if (_options.silent) {
			return undefined;
		}
		throw kind === 'permissive'
			? new MinimalModeError()
			: new Error('GitHub authentication is unavailable in offline mode.');
	}

	async getPermissiveGitHubToken(): Promise<string | undefined> {
		return undefined;
	}

	async getAnyGitHubToken(): Promise<string | undefined> {
		return undefined;
	}

	async refreshCopilotToken(): Promise<void> {
		// In offline mode, we don't need to refresh tokens
		this._logService?.debug?.('Offline mode: skipping token refresh');
	}

	async signOut(): Promise<void> {
		// No-op in offline mode
		this._logService?.debug?.('Offline mode: sign-out is not applicable');
	}

	async getAnyGitHubSession(_options?: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined> {
		return undefined;
	}

	async getPermissiveGitHubSession(_options: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined> {
		return undefined;
	}

	async getCopilotToken(force?: boolean): Promise<CopilotToken> {
		if (!this._copilotToken || force) {
			this._copilotToken = await this._copilotTokenManager.getCopilotToken(force);
		}
		return this._copilotToken;
	}

	resetCopilotToken(httpError?: number): void {
		// No-op in offline mode
		this._logService?.debug?.('Offline mode: resetting copilot token is not applicable');
	}

	async getAdoAccessTokenBase64(options?: AuthenticationGetSessionOptions): Promise<string | undefined> {
		// Not available in offline mode
		return undefined;
	}

	get speculativeDecodingEndpointToken(): string | undefined {
		// Not available in offline mode
		return undefined;
	}

	set speculativeDecodingEndpointToken(value: string | undefined) {
		// No-op in offline mode
	}
}
