/* @jsx m */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import m from 'mithril';
import $ from 'jquery';
import _ from 'underscore';

import 'modals/session_signin_modal.scss';

import app from 'state';
import { CWButton } from '../components/component_kit/cw_button';
import { CWWalletsList } from '../components/component_kit/cw_wallets_list';
import TerraWalletConnectWebWalletController from 'controllers/app/webWallets/terra_walletconnect_web_wallet';
import WalletConnectWebWalletController from 'controllers/app/webWallets/walletconnect_web_wallet';

const SessionSigninModal = {
  confirmExit: async () => true,
  view(vnode) {
    const chainbase = app.chain?.meta?.base;
    const wallets = app.wallets.availableWallets(chainbase);

    const wcEnabled = _.any(
      wallets,
      (w) =>
        (w instanceof WalletConnectWebWalletController ||
          w instanceof TerraWalletConnectWebWalletController) &&
        w.enabled
    );

    return (
      <div
        class="SessionSigninModal"
        onclick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onmousedown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div class="compact-modal-body">
          <h3>Re-connect wallet</h3>
          <p>
            Your previous login was awhile ago. Re-connect your wallet to
            continue:
          </p>
        </div>
        <div class="compact-modal-actions">
          <div>
            <CWWalletsList
              useSessionKeyLoginFlow={true}
              wallets={wallets}
              darkMode={false}
              setSelectedWallet={(wallet) => {
                /* do nothing */
              }}
              accountVerifiedCallback={(account) => {
                $(vnode.dom).trigger('modalcomplete');
                $(vnode.dom).trigger('modalexit');
              }}
              linking={false}
              hideConnectAnotherWayLink={true}
              showResetWalletConnect={wcEnabled}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const sessionSigninModal = () => {
  return new Promise<void>((resolve, reject) => {
    app.modals.create({
      modal: SessionSigninModal,
      data: {},
      completeCallback: () => resolve(),
      exitCallback: () => reject(new Error('Invalid signature')),
    });
  });
};
