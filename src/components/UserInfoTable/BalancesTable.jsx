import { Button } from 'antd';
import React from 'react';
import styled from 'styled-components';
import {
  useTokenAccounts,
  getSelectedTokenAccountForMint,
} from '../../utils/markets';
import DataTable from '../layout/DataTable';
import { useSendConnection } from '../../utils/connection';
import { useWallet } from '../../utils/wallet';
import { settleFunds } from '../../utils/send';
import { useTranslation } from 'react-i18next';
import { notify } from '../../utils/notifications';

const CustomButton = styled(Button)`
  margin-right: 12px;
  background-color: #212734;
  &:hover {
    background: #9999ff;
  }
`;

export default function BalancesTable({
  balances,
  showMarket,
  hideWalletBalance,
  onSettleSuccess,
}) {
  const [accounts] = useTokenAccounts();
  const connection = useSendConnection();
  const { wallet } = useWallet();
  const { t } = useTranslation();

  async function onSettleFunds(market, openOrders) {
    try {
      await settleFunds({
        market,
        openOrders,
        connection,
        wallet,
        baseCurrencyAccount: getSelectedTokenAccountForMint(
          accounts,
          market?.baseMintAddress,
        ),
        quoteCurrencyAccount: getSelectedTokenAccountForMint(
          accounts,
          market?.quoteMintAddress,
        ),
      });
    } catch (e) {
      notify({
        message: 'Error settling funds',
        description: e.message,
        type: 'error',
      });
      return;
    }
    onSettleSuccess && onSettleSuccess();
  }

  const columns = [
    showMarket
      ? {
          title: 'Market',
          dataIndex: 'marketName',
          key: 'marketName',
        }
      : null,
    {
      title: t('Coin'),
      dataIndex: 'coin',
      key: 'coin',
    },
    hideWalletBalance
      ? null
      : {
          title: 'Wallet Balance',
          dataIndex: 'wallet',
          key: 'wallet',
        },
    {
      title: t('Orders'),
      dataIndex: 'orders',
      key: 'orders',
    },
    {
      title: t('Unsettled'),
      dataIndex: 'unsettled',
      key: 'unsettled',
    },
    {
      key: 'action',
      render: ({ market, openOrders, marketName }) => (
        <div style={{ textAlign: 'right' }}>
          <CustomButton onClick={() => onSettleFunds(market, openOrders)}>
            Settle {marketName}
          </CustomButton>
        </div>
      ),
    },
  ].filter((x) => x);
  return (
    <DataTable
      emptyLabel={t('No balances')}
      dataSource={balances}
      columns={columns}
      pagination={false}
    />
  );
}
