import type { Signer } from '@polkadot/api/types';

import {
  isWeb3Injected,
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { SignerPayloadRaw } from '@polkadot/types/types/extrinsic';
import { stringToHex } from '@polkadot/util';

import type { SessionPayload } from '@canvas-js/interfaces';

import { ChainBase, ChainNetwork, WalletId } from 'common-common/src/types';
import { addressSwapper } from 'commonwealth/shared/utils';

import type { Account, IWebWallet } from 'models';
import app from 'state';

class PolkadotWebWalletController
  implements IWebWallet<InjectedAccountWithMeta>
{
  // GETTERS/SETTERS
  private _enabled: boolean;
  private _accounts: InjectedAccountWithMeta[];
  private _enabling = false;

  public readonly name = WalletId.Polkadot;
  public readonly label = 'polkadot.js';
  public readonly defaultNetwork = ChainNetwork.Edgeware;
  public readonly chain = ChainBase.Substrate;

  public get available() {
    return isWeb3Injected;
  }

  public get enabled() {
    return this.available && this._enabled;
  }

  public get enabling() {
    return this._enabling;
  }

  public get accounts() {
    return this._accounts || [];
  }

  public async getSigner(who: string): Promise<Signer> {
    // finds an injector for an address
    // web wallet stores addresses in testnet format for now, so we have to re-encode
    const reencodedAddress = addressSwapper({
      address: who,
      currentPrefix: 42,
    });
    const injector = await web3FromAddress(reencodedAddress);
    return injector.signer;
  }

  public getChainId() {
    return app.chain?.id || this.defaultNetwork;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getRecentBlock(chainIdentifier: string) {
    return null;
  }

  // ACTIONS
  public async signCanvasMessage(
    account: Account,
    canvasMessage: SessionPayload
  ): Promise<string> {
    const canvas = await import('@canvas-js/interfaces');
    const message = stringToHex(canvas.serializeSessionPayload(canvasMessage));

    const signer = await this.getSigner(account.address);
    const payload: SignerPayloadRaw = {
      address: account.address,
      data: message,
      type: 'bytes',
    };
    const signature = (await signer.signRaw(payload)).signature;
    return signature;
  }

  public async enable() {
    console.log('Attempting to enable Substrate web wallet');
    if (!this.available) throw new Error('Web wallet not available');

    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    this._enabling = true;
    try {
      await web3Enable('commonwealth');

      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the extension that provides this account
      this._accounts = await web3Accounts();

      this._enabled = true;
      this._enabling = false;
    } catch (error) {
      console.error('Failed to enable polkadot wallet');
      this._enabling = false;
    }
  }
}

export default PolkadotWebWalletController;
