/* @jsx m */

import ClassComponent from 'class_component';
import type Substrate from 'controllers/chain/substrate/adapter';
import { proposalSlugToClass } from 'identifiers';
import m from 'mithril';
import type { ITXModalData, ProposalModule } from 'models';

import app from 'state';
import { ProposalType } from '../../../../../../common-common/src/types';
import { CWButton } from '../../components/component_kit/cw_button';
import { CWLabel } from '../../components/component_kit/cw_label';
import { CWSpinner } from '../../components/component_kit/cw_spinner';
import { CWTextArea } from '../../components/component_kit/cw_text_area';
import { CWTextInput } from '../../components/component_kit/cw_text_input';
import User from '../../components/widgets/user';
import { createTXModal } from '../../modals/tx_signing_modal';
import ErrorPage from '../error';

export class SubstrateTreasuryTipForm extends ClassComponent {
  private beneficiary: string;
  private description: string;

  view() {
    const author = app.user.activeAccount;
    const substrate = app.chain as Substrate;

    // TODO: this is only true if the proposer is doing reportAwesome()
    //   we need special code for newTip().
    if (!substrate.tips.initialized) {
      if (substrate.chain?.timedOut) {
        return <ErrorPage message="Could not connect to chain" />;
      } else {
        return <CWSpinner />;
      }
    }

    return (
      <>
        <CWLabel label="Finder" />,
        {m(User, {
          user: author,
          linkify: true,
          popover: true,
          showAddressWithDisplayName: true,
        })}
        <CWTextInput
          label="Beneficiary"
          placeholder="Beneficiary of treasury proposal"
          oninput={(e) => {
            this.beneficiary = e.target.value;
          }}
        />
        <CWTextArea
          label="Reason"
          placeholder="What’s the reason you want to tip the beneficiary?"
          oninput={(e) => {
            this.description = e.target.value;
          }}
        />
        <CWButton
          label="Send transaction"
          onclick={(e) => {
            e.preventDefault();

            if (!this.beneficiary) {
              throw new Error('Invalid beneficiary address');
            }

            const createFunc: (
              ...args
            ) => ITXModalData | Promise<ITXModalData> = (a) => {
              return (
                proposalSlugToClass().get(
                  ProposalType.SubstrateTreasuryTip
                ) as ProposalModule<any, any, any>
              ).createTx(...a);
            };

            const beneficiary = app.chain.accounts.get(this.beneficiary);

            const args = [author, this.description, beneficiary];

            Promise.resolve(createFunc(args)).then((modalData) =>
              createTXModal(modalData)
            );
          }}
        />
      </>
    );
  }
}
