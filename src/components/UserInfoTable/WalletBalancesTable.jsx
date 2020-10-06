import React from 'react';
import DataTable from '../layout/DataTable';
import { useTranslation } from 'react-i18next';

export default function WalletBalancesTable({
  loaded = false,
  walletBalances,
}) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('Coin'),
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('Wallet Balance'),
      dataIndex: 'wallet',
      key: 'wallet',
    },
  ];
  return (
    <DataTable
      emptyLabel="No balances"
      dataSource={walletBalances}
      columns={columns}
      pagination={false}
      loading={!loaded}
    />
  );
}
