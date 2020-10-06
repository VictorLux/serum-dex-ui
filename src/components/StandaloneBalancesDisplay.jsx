import { Button, Col, Divider, Row } from 'antd';
import React, { useState } from 'react';
import FloatingElement from './layout/FloatingElement';
import styled from 'styled-components';
import {
  useBalances,
  useMarket,
  useSelectedBaseCurrencyAccount,
  useSelectedOpenOrdersAccount,
  useSelectedQuoteCurrencyAccount,
} from '../utils/markets';
import DepositDialog from './DepositDialog';
import { useWallet } from '../utils/wallet';
import Link from './Link';
import { settleFunds } from '../utils/send';
import { useSendConnection } from '../utils/connection';
import { useTranslation } from 'react-i18next';
import { notify } from '../utils/notifications';

const RowBox = styled(Row)`
  padding-bottom: 20px;
`;

const Tip = styled.p`
  font-size: 12px;
  padding-top: 6px;
`;

const ActionButton = styled(Button)`
  color: #ffffff;
  background-color: #212734;
  border-width: 0px;
  &:hover {
    background: #9999ff;
  }
`;

export default function StandaloneBalancesDisplay() {
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const balances = useBalances();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const connection = useSendConnection();
  const { providerUrl, providerName, wallet } = useWallet();
  const [baseOrQuote, setBaseOrQuote] = useState('');
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const baseCurrencyBalances =
    balances && balances.find((b) => b.coin === baseCurrency);
  const quoteCurrencyBalances =
    balances && balances.find((b) => b.coin === quoteCurrency);

  const { t } = useTranslation();

  async function onSettleFunds() {
    try {
      await settleFunds({
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

  return (
    <FloatingElement style={{ flex: 1, paddingTop: 10, background: '#0a0d1f' }}>
      {[
        [baseCurrency, baseCurrencyBalances, 'base'],
        [quoteCurrency, quoteCurrencyBalances, 'quote'],
      ].map(([currency, balances, baseOrQuote], index) => (
        <React.Fragment key={index}>
          <Divider style={{ borderColor: 'white' }}>{currency}</Divider>
          <RowBox
            align="middle"
            justify="space-between"
            style={{ paddingBottom: 12 }}
          >
            <Col>{t('Wallet balance')}:</Col>
            <Col>{balances && balances.wallet}</Col>
          </RowBox>
          <RowBox
            align="middle"
            justify="space-between"
            style={{ paddingBottom: 12 }}
          >
            <Col>{t('Unsettled balance')}:</Col>
            <Col>{balances && balances.unsettled}</Col>
          </RowBox>
          <RowBox align="middle" justify="space-around">
            <Col style={{ width: 150 }}>
              <ActionButton
                block
                size="large"
                onClick={() => setBaseOrQuote(baseOrQuote)}
              >
                {t('Deposit')}
              </ActionButton>
            </Col>
            <Col style={{ width: 150 }}>
              <ActionButton block size="large" onClick={onSettleFunds}>
                {t('Settle')}
              </ActionButton>
            </Col>
          </RowBox>
          <Tip>
            All deposits go to your{' '}
            <Link external to={providerUrl} style={{ color: 'white' }}>
              {providerName}
            </Link>{' '}
            wallet
          </Tip>
        </React.Fragment>
      ))}
      <DepositDialog
        baseOrQuote={baseOrQuote}
        onClose={() => setBaseOrQuote('')}
      />
    </FloatingElement>
  );
}
