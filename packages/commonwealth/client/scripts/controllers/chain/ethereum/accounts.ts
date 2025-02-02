import type { EthereumCoin } from 'adapters/chain/ethereum/types';
import assert from 'assert';
import type { IAccountsModule } from 'models';
import type { IApp } from 'state';
import { AccountsStore } from 'stores';
import EthereumAccount from './account';
import type EthereumChain from './chain';

// NOTE: this is just a boilerplate class; not verified to work yet.
// TODO: hook this up to rest of the application and verify that it works
class EthereumAccounts
  implements IAccountsModule<EthereumCoin, EthereumAccount>
{
  private _initialized = false;
  public get initialized() {
    return this._initialized;
  }

  // STORAGE
  protected _store: AccountsStore<EthereumAccount> = new AccountsStore();
  public get store() {
    return this._store;
  }

  private _Chain: EthereumChain;

  public get(address: string) {
    return this.fromAddress(address);
  }

  private _app: IApp;
  public get app() {
    return this._app;
  }

  constructor(app: IApp) {
    this._app = app;
  }

  public fromAddress(address: string): EthereumAccount {
    if (address.indexOf('0x') !== -1) {
      assert(address.length === 42);
    } else {
      assert(address.length === 40);
      address = `0x${address}`;
    }
    try {
      return this._store.getByAddress(address);
    } catch (e) {
      return new EthereumAccount(this.app, this._Chain, this, address);
    }
  }

  public deinit() {
    this._initialized = false;
    this.store.clear();
  }

  public init(ChainInfo: EthereumChain): Promise<void> {
    this._Chain = ChainInfo;
    this._initialized = true;
    return Promise.resolve();
  }
}

export default EthereumAccounts;
