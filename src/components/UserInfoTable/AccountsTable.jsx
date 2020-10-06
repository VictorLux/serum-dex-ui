import { Button } from 'antd';
import React from 'react';
import DataTable from '../layout/DataTable';
import { useConnection } from '../../utils/connection';
import { useWallet } from '../../utils/wallet';
import { settleFunds } from '../../utils/send';
import { useTranslation } from 'react-i18next';
import { notify } from '../../utils/notifications';

export default function AccountsTable({ accountBalances }) {
  const connection = useConnection();
  const { wallet } = useWallet();
  const { t } = useTranslation();

  async function onSettleFunds(account) {
    try {
      const {
        market,
        openOrdersAccount,
        baseCurrencyAccount,
        quoteCurrencyAccount,
      } = account;
      return await settleFunds({
        market,
        openOrders: openOrdersAccount,
        connection,
        wallet,
        baseCurrencyAccount,
        quoteCurrencyAccount,
      });
    } catch (e) {
      notify({
        message: 'Error settling funds',
        description: e.message,
        type: 'error',
      });
    }
  }

  const columns = [
    {
      title: t('Market'),
      dataIndex: 'key',
      key: 'key',
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
      render: (account) => (
        <div style={{ textAlign: 'right' }}>
          <Button
            ghost
            style={{ marginRight: 12 }}
            onClick={() => onSettleFunds(account)}
          >
            Settle
          </Button>
        </div>
      ),
    },
  ];
  return (
    <DataTable
      emptyLabel="No balances"
      dataSource={accountBalances}
      columns={columns.map((data) => ({
        ...data,
        key: `${data.market}${data.coin}`,
      }))}
      pagination={false}
    />
  );
}
