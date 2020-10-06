import { Button, Input, Radio, Switch, Slider } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  useBaseCurrencyBalances,
  useQuoteCurrencyBalances,
  useMarket,
  useMarkPrice,
  useSelectedOpenOrdersAccount,
  useSelectedBaseCurrencyAccount,
  useSelectedQuoteCurrencyAccount,
} from '../utils/markets';
import { useWallet } from '../utils/wallet';
import { notify } from '../utils/notifications';
import {
  getDecimalCount,
  roundToDecimal,
  floorToDecimal,
} from '../utils/utils';
import { useSendConnection } from '../utils/connection';
import FloatingElement from './layout/FloatingElement';
import { placeOrder } from '../utils/send';
import { useTranslation } from 'react-i18next';

const SellButton = styled(Button)`
  margin: 20px 0px 0px 0px;
  background: #0a0d1f;
  border-color: #f23b69;
  color: #f23b69;
  &:hover {
    background: #f23b69;
    color: #0a0d1f;
  }
`;

const BuyButton = styled(Button)`
  margin: 20px 0px 0px 0px;
  background: #0a0d1f;
  border-color: #51d07b;
  color: #51d07b;
  &:hover {
    background: #51d07b;
    color: #0a0d1f;
  }
`;

const sliderMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
};

export default function TradeForm({ style, setChangeOrderRef }) {
  const [side, setSide] = useState('buy');
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const baseCurrencyBalances = useBaseCurrencyBalances();
  const quoteCurrencyBalances = useQuoteCurrencyBalances();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const { wallet } = useWallet();
  const sendConnection = useSendConnection();
  const markPrice = useMarkPrice();

  const { t } = useTranslation();

  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);
  const [baseSize, setBaseSize] = useState(null);
  const [quoteSize, setQuoteSize] = useState(null);
  const [price, setPrice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sizeFraction, setSizeFraction] = useState(0);

  const availableQuote = openOrdersAccount
    ? market.quoteSplSizeToNumber(openOrdersAccount.quoteTokenFree)
    : 0;

  let quoteBalance = (quoteCurrencyBalances || 0) + (availableQuote || 0);
  let baseBalance = baseCurrencyBalances || 0;
  let sizeDecimalCount =
    market?.minOrderSize && getDecimalCount(market.minOrderSize);
  let priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize);

  useEffect(() => {
    setChangeOrderRef && setChangeOrderRef(doChangeOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChangeOrderRef]);

  useEffect(() => {
    baseSize && price && onSliderChange(sizeFraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  useEffect(() => {
    updateSizeFraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, baseSize]);

  const onSetBaseSize = (baseSize) => {
    setBaseSize(baseSize);
    const rawQuoteSize = baseSize * (price || markPrice);
    const quoteSize =
      baseSize && roundToDecimal(rawQuoteSize, sizeDecimalCount);
    setQuoteSize(quoteSize);
  };

  const onSetQuoteSize = (quoteSize) => {
    setQuoteSize(quoteSize);
    let rawBaseSize;
    if (price) {
      rawBaseSize = quoteSize / price;
    } else {
      rawBaseSize = quoteSize / markPrice;
    }
    const baseSize = quoteSize && roundToDecimal(rawBaseSize, sizeDecimalCount);
    setBaseSize(baseSize);
  };

  const doChangeOrder = ({ size, price }) => {
    const formattedSize = size && roundToDecimal(size, sizeDecimalCount);
    const formattedPrice = price && roundToDecimal(price, priceDecimalCount);
    formattedSize && onSetBaseSize(formattedSize);
    formattedPrice && setPrice(formattedPrice);
  };

  const updateSizeFraction = () => {
    const rawMaxSize = side === 'buy' ? quoteBalance / price : baseBalance;
    const maxSize = floorToDecimal(rawMaxSize, sizeDecimalCount);
    const sizeFraction = Math.min((baseSize / maxSize) * 100, 100);
    setSizeFraction(sizeFraction);
  };

  const onSliderChange = (value) => {
    if (!price && markPrice) {
      let formattedMarkPrice = priceDecimalCount
        ? markPrice.toFixed(priceDecimalCount)
        : markPrice;
      setPrice(formattedMarkPrice);
    }

    let newSize;
    if (side === 'buy') {
      if (price || markPrice) {
        newSize = ((quoteBalance / (price || markPrice)) * value) / 100;
      }
    } else {
      newSize = (baseBalance * value) / 100;
    }

    // round down to minOrderSize increment
    let formatted = floorToDecimal(newSize, sizeDecimalCount);

    onSetBaseSize(formatted);
  };

  const postOnChange = (checked) => {
    if (checked) {
      setIoc(false);
    }
    setPostOnly(checked);
  };
  const iocOnChange = (checked) => {
    if (checked) {
      setPostOnly(false);
    }
    setIoc(checked);
  };

  async function onSubmit(isMarketOrder) {
    const parsedPrice = !isMarketOrder
      ? parseFloat(price)
      : isMarketOrder
      ? side === 'buy'
        ? parseFloat(roundToDecimal(markPrice * 1.05, priceDecimalCount))
        : parseFloat(roundToDecimal(markPrice * 0.95, priceDecimalCount))
      : null;

    console.log('Parsed Price', parsedPrice);
    const parsedSize = parseFloat(baseSize);

    setSubmitting(true);
    try {
      await placeOrder({
        side,
        price: parsedPrice,
        size: parsedSize,
        orderType: ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit',
        market,
        connection: sendConnection,
        wallet,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
      });
      setPrice(null);
      onSetBaseSize(null);
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FloatingElement
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
        background: '#0a0d1f',
      }}
    >
      <div style={{ flex: 1 }}>
        <Radio.Group
          onChange={(e) => setSide(e.target.value)}
          value={side}
          buttonStyle="solid"
          style={{
            marginBottom: 8,
            width: '100%',
          }}
        >
          <Radio.Button
            value="buy"
            style={{
              width: '50%',
              textAlign: 'center',
              background: side === 'buy' ? '#02bf76' : '',
              borderColor: side === 'buy' ? '#02bf76' : '',
            }}
          >
            {t('BUY')}
          </Radio.Button>
          <Radio.Button
            value="sell"
            style={{
              width: '50%',
              textAlign: 'center',
              background: side === 'sell' ? '#F23B69' : '',
              borderColor: side === 'sell' ? '#F23B69' : '',
            }}
          >
            {t('SELL')}
          </Radio.Button>
        </Radio.Group>
        <Input
          style={{
            textAlign: 'right',
            // paddingBottom: 8,
            background: 'rgb(153, 153, 255, 0.1)',
            borderBottom: '0.5px solid',
            borderImage:
              'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
          }}
          addonBefore={<div style={{ width: '30px' }}>{t('Price')}</div>}
          suffix={
            <span style={{ fontSize: 10, opacity: 0.5 }}>{quoteCurrency}</span>
          }
          value={price}
          type="number"
          step={market?.tickSize || 1}
          onChange={(e) => setPrice(e.target.value)}
        />
        <div style={{ paddingBottom: 8 }} />
        <Input.Group
          compact
          style={{
            // paddingBottom: 8,
            background: 'rgb(153, 153, 255, 0.1)',
            borderBottom: '0.5px solid',
            borderImage:
              'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
          }}
        >
          <Input
            style={{ width: 'calc(50% + 30px)', textAlign: 'right' }}
            addonBefore={<div style={{ width: '30px' }}>{t('Size')}</div>}
            suffix={
              <span style={{ fontSize: 10, opacity: 0.5 }}>{baseCurrency}</span>
            }
            value={baseSize}
            type="number"
            step={market?.minOrderSize || 1}
            onChange={(e) => onSetBaseSize(e.target.value)}
          />
          <Input
            style={{ width: 'calc(50% - 30px)', textAlign: 'right' }}
            suffix={
              <span style={{ fontSize: 10, opacity: 0.5 }}>
                {quoteCurrency}
              </span>
            }
            value={quoteSize}
            type="number"
            step={market?.minOrderSize || 1}
            onChange={(e) => onSetQuoteSize(e.target.value)}
          />
        </Input.Group>
        <Slider
          value={sizeFraction}
          tipFormatter={(value) => `${value}%`}
          marks={sliderMarks}
          onChange={onSliderChange}
        />
        <div style={{ paddingTop: 18 }}>
          {'POST '}
          <Switch
            checked={postOnly}
            onChange={postOnChange}
            style={{
              marginRight: 40,
              background: postOnly
                ? 'linear-gradient(90deg, rgba(51,51,255,1) 0%, rgba(128,128,255,1) 100%)'
                : 'rgb(85,86,96)',
            }}
          />
          {'IOC '}
          <Switch
            checked={ioc}
            onChange={iocOnChange}
            style={{
              background: ioc
                ? 'linear-gradient(90deg, rgba(51,51,255,1) 0%, rgba(128,128,255,1) 100%)'
                : 'rgb(85,86,96)',
            }}
          />
        </div>
      </div>
      {side === 'buy' ? (
        <>
          <BuyButton
            disabled={!price || !baseSize}
            onClick={() => onSubmit(false)}
            block
            type="primary"
            size="large"
            loading={submitting}
          >
            {t('Limit Buy')} {baseCurrency}
          </BuyButton>
          <BuyButton
            disabled={!baseSize || baseSize <= 0}
            onClick={() => onSubmit(true)}
            block
            type="primary"
            size="large"
            loading={submitting}
          >
            {t('Market Buy')} {baseCurrency}
          </BuyButton>
        </>
      ) : (
        <>
          <SellButton
            disabled={!price || !baseSize}
            onClick={() => onSubmit(false)}
            block
            type="primary"
            size="large"
            loading={submitting}
          >
            {t('Limit Sell')} {baseCurrency}
          </SellButton>
          <SellButton
            disabled={!baseSize || baseSize <= 0}
            onClick={() => onSubmit(true)}
            block
            type="primary"
            size="large"
            loading={submitting}
          >
            {t('Market Sell')} {baseCurrency}
          </SellButton>
        </>
      )}
    </FloatingElement>
  );
}
