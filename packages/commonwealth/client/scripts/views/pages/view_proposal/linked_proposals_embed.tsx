/* @jsx m */

import { navigateToSubpage } from 'router';
import ClassComponent from 'class_component';
import { ProposalType } from 'common-common/src/types';
import type Substrate from 'controllers/chain/substrate/adapter';
import SubstrateDemocracyProposal from 'controllers/chain/substrate/democracy_proposal';
import { SubstrateDemocracyReferendum } from 'controllers/chain/substrate/democracy_referendum';
import { SubstrateTreasuryProposal } from 'controllers/chain/substrate/treasury_proposal';
import { idToProposal } from 'identifiers';
import m from 'mithril';

import 'pages/view_proposal/linked_proposals_embed.scss';

import app from 'state';
import { CWButton } from '../../components/component_kit/cw_button';
import { CWText } from '../../components/component_kit/cw_text';

export type LinkedSubstrateProposal =
  | SubstrateDemocracyProposal
  | SubstrateDemocracyReferendum
  | SubstrateTreasuryProposal;

type LinkedProposalsEmbedAttrs = {
  proposal: LinkedSubstrateProposal;
};

export class LinkedProposalsEmbed extends ClassComponent<LinkedProposalsEmbedAttrs> {
  view(vnode: m.Vnode<LinkedProposalsEmbedAttrs>) {
    const { proposal } = vnode.attrs;

    // show link to treasury proposal if this is a proposal that passes a treasury spend
    if (
      proposal instanceof SubstrateDemocracyProposal ||
      proposal instanceof SubstrateDemocracyReferendum
    ) {
      let treasuryProposalIndex;

      const call =
        proposal instanceof SubstrateDemocracyProposal
          ? proposal.preimage
          : proposal instanceof SubstrateDemocracyReferendum
          ? proposal.preimage
          : null;

      if (
        call?.section === 'treasury' &&
        (call.method === 'approveProposal' || call.method === 'rejectProposal')
      ) {
        treasuryProposalIndex = call.args[0];

        try {
          idToProposal(
            ProposalType.SubstrateTreasuryProposal,
            +treasuryProposalIndex
          );
        } catch (e) {
          // do nothing if treasury proposal was not indexed
        }
      }

      if (
        !(
          (proposal instanceof SubstrateDemocracyProposal &&
            proposal.getReferendum()) ||
          (proposal instanceof SubstrateDemocracyReferendum &&
            proposal.preimage &&
            proposal.getProposalOrMotion(proposal.preimage))
        )
      ) {
        return;
      }

      return (
        <div class="LinkedProposalsEmbed">
          {proposal instanceof SubstrateDemocracyProposal &&
            proposal.getReferendum() && (
              <>
                <CWText>
                  Became referendum {proposal.getReferendum().identifier}
                </CWText>
                {app.activeChainId() && (
                  <CWButton
                    buttonType="tertiary-blue"
                    onclick={(e) => {
                      e.preventDefault();
                      navigateToSubpage(
                        `/proposal/${
                          ProposalType.SubstrateDemocracyReferendum
                        }/${proposal.getReferendum().identifier}`
                      );
                    }}
                    label="Go to referendum"
                  />
                )}
              </>
            )}
          {proposal instanceof SubstrateDemocracyReferendum &&
            proposal.preimage &&
            proposal.getProposalOrMotion(proposal.preimage) && (
              <>
                <CWText>
                  Via {proposal.getProposalOrMotion(proposal.preimage).slug}{' '}
                  {proposal.getProposalOrMotion(proposal.preimage).identifier}
                </CWText>
                {app.activeChainId() && (
                  <CWButton
                    buttonType="tertiary-blue"
                    onclick={(e) => {
                      e.preventDefault();
                      navigateToSubpage(
                        `/proposal/${
                          proposal.getProposalOrMotion(proposal.preimage).slug
                        }/${
                          proposal.getProposalOrMotion(proposal.preimage)
                            .identifier
                        }`
                      );
                    }}
                    label="Go to proposal"
                  />
                )}
              </>
            )}
        </div>
      );
    } else if (proposal instanceof SubstrateTreasuryProposal) {
      const democracyProposals = (
        (app.chain as Substrate).democracyProposals?.store?.getAll() || []
      ).filter(
        (p) =>
          p.preimage?.section === 'treasury' &&
          (p.preimage?.method === 'approveProposal' ||
            p.preimage?.method === 'rejectProposal') &&
          p.preimage?.args[0] === proposal.identifier
      );

      const referenda = (
        (app.chain as Substrate).democracy?.store?.getAll() || []
      ).filter(
        (r) =>
          r.preimage?.section === 'treasury' &&
          (r.preimage?.method === 'approveProposal' ||
            r.preimage?.method === 'rejectProposal') &&
          r.preimage?.args[0] === proposal.identifier
      );

      if (democracyProposals.length === 0 && referenda.length === 0) {
        return;
      }

      return (
        <div class="LinkedProposalsEmbed">
          {democracyProposals.map((p) => (
            <>
              <CWText fontWeight="semiBold">
                Democracy Proposal ${p.shortIdentifier}
              </CWText>
              <CWText>
                {p.preimage?.method === 'approveProposal' &&
                  'Approves this proposal'}
                {p.preimage?.method === 'rejectProposal' &&
                  'Rejects this proposal'}
              </CWText>
              {app.activeChainId() && (
                <CWButton
                  buttonType="tertiary-blue"
                  onclick={(e) => {
                    e.preventDefault();
                    navigateToSubpage(
                      `/proposal/${ProposalType.SubstrateDemocracyProposal}/${p.identifier}`
                    );
                  }}
                  label="Go to democracy proposal"
                />
              )}
            </>
          ))}
          {referenda.map((r) => (
            <>
              <CWText fontWeight="semiBold">Referendum {r.identifier}</CWText>
              <CWText>
                {r.preimage?.method === 'approveProposal' &&
                  'Approves this proposal'}
                {r.preimage?.method === 'rejectProposal' &&
                  'Rejects this proposal'}
              </CWText>
              {app.activeChainId() && (
                <CWButton
                  buttonType="tertiary-blue"
                  onclick={(e) => {
                    e.preventDefault();
                    navigateToSubpage(
                      `/proposal/${ProposalType.SubstrateDemocracyReferendum}/${r.identifier}`
                    );
                  }}
                  label="Go to referendum"
                />
              )}
            </>
          ))}
        </div>
      );
    }
  }
}
