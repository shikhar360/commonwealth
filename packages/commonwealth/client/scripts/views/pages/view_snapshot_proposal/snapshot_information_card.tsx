/* @jsx m */

import ClassComponent from 'class_component';
import type { SnapshotProposal } from 'helpers/snapshot_utils';
import { capitalize } from 'lodash';
import m from 'mithril';
import { AddressInfo } from 'models';
import moment from 'moment';

import 'pages/snapshot/snapshot_information_card.scss';

import app from 'state';
import { CWContentPageCard } from '../../components/component_kit/cw_content_page';
import { CWIcon } from '../../components/component_kit/cw_icons/cw_icon';
import { CWText } from '../../components/component_kit/cw_text';
import User from '../../components/widgets/user';
import { SnapshotThreadLink } from '../view_proposal/proposal_header_links';

type SnapshotInfoRowAttrs = {
  label: string;
  value: string | m.Vnode;
};

class SnapshotInfoRow extends ClassComponent<SnapshotInfoRowAttrs> {
  view(vnode: m.Vnode<SnapshotInfoRowAttrs>) {
    const { label, value } = vnode.attrs;

    return (
      <div class="SnapshotInfoRow">
        <CWText type="caption" className="snapshot-info-row-label">
          {label}
        </CWText>
        <CWText noWrap>{value}</CWText>
      </div>
    );
  }
}

type SnapshotInfoLinkRowAttrs = SnapshotInfoRowAttrs & { url: string };

class SnapshotInfoLinkRow extends ClassComponent<SnapshotInfoLinkRowAttrs> {
  view(vnode: m.Vnode<SnapshotInfoLinkRowAttrs>) {
    const { label, url, value } = vnode.attrs;

    return (
      <div class="SnapshotInfoRow">
        <CWText type="caption" className="snapshot-info-row-label">
          {label}
        </CWText>
        <a href={url} target="_blank">
          <CWText className="snapshot-link" noWrap>
            {value}
          </CWText>
          <CWIcon iconName="externalLink" iconSize="small" />
        </a>
      </div>
    );
  }
}

type SnapshotInformationCardAttrs = {
  proposal: SnapshotProposal;
  threads: Array<{ id: string; title: string }> | null;
};

export class SnapshotInformationCard extends ClassComponent<SnapshotInformationCardAttrs> {
  view(vnode: m.Vnode<SnapshotInformationCardAttrs>) {
    const { proposal, threads } = vnode.attrs;

    const votingSystem = capitalize(
      proposal.type.split('-').join(' ').concat(' voting')
    );

    return (
      <CWContentPageCard
        header="Information"
        content={
          <div className="SnapshotInformationCard">
            <div class="info-rows-container">
              <SnapshotInfoRow
                label="Author"
                value={
                  app.chain
                    ? m(User, {
                        user: new AddressInfo(
                          null,
                          proposal.author,
                          app.activeChainId(),
                          null
                        ),
                        hideAvatar: true,
                        linkify: true,
                        popover: true,
                      })
                    : proposal.author
                }
              />
              <SnapshotInfoLinkRow
                label="IPFS"
                value={`#${proposal.ipfs}`}
                url={`https://ipfs.fleek.co/ipfs/${proposal.ipfs}`}
              />
              <SnapshotInfoRow label="Voting System" value={votingSystem} />
              <SnapshotInfoRow
                label="Start Date"
                value={moment(+proposal.start * 1000).format('lll')}
              />
              <SnapshotInfoRow
                label="End Date"
                value={moment(+proposal.end * 1000).format('lll')}
              />
              <SnapshotInfoLinkRow
                label={
                  proposal.strategies.length > 1 ? 'Strategies' : 'Strategy'
                }
                value={
                  proposal.strategies.length > 1
                    ? `${proposal.strategies.length} Strategies`
                    : proposal.strategies[0].name
                }
                url={`https://snapshot.org/#/${app.snapshot.space.id}/proposal/${proposal.id}`}
              />
              <SnapshotInfoLinkRow
                label="Snapshot"
                value={`#${proposal.snapshot}`}
                url={`https://etherscan.io/block/${proposal.snapshot}`}
              />
            </div>
            {!!threads && (
              <div class="linked-discussions">
                <CWText type="h5" fontWeight="semiBold">
                  Linked Discussions
                </CWText>
                {threads.map((thread) => (
                  <SnapshotThreadLink thread={thread} />
                ))}
              </div>
            )}
          </div>
        }
      />
    );
  }
}
