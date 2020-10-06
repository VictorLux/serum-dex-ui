import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Menu, Popover, Select } from 'antd';
import React, { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../assets/logo-big.svg';
import styled from 'styled-components';
import { useWallet, WALLET_PROVIDERS } from '../utils/wallet';
import { ENDPOINTS, useConnectionConfig } from '../utils/connection';
import LinkAddress from './LinkAddress';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import Settings from './Settings';

const Wrapper = styled.div`
  background-color: #0a0d1f;
  background: #0a0d1f;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0px 30px;
  flex-wrap: wrap;
`;
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: rgb(79, 86, 219);
  font-weight: bold;
  cursor: pointer;
  img {
    height: 30px;
    margin-right: 8px;
  }
`;

export default function TopBar() {
  const { connected, wallet, providerUrl, setProvider } = useWallet();
  const { endpoint, setEndpoint } = useConnectionConfig();
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();
  const publicKey = wallet?.publicKey?.toBase58();

  const handleClick = useCallback(
    (e) => {
      history.push(e.key);
    },
    [history],
  );

  return (
    <Wrapper>
      <LogoWrapper>
        <img src={logo} alt="" onClick={() => history.push('/')} />
        {'BONFIDA + SERUM'}
      </LogoWrapper>
      <Menu
        mode="horizontal"
        onClick={handleClick}
        selectedKeys={[location.pathname]}
        style={{
          borderBottom: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'flex-end',
          flex: 1,
        }}
      >
        <Menu.Item key="/">{t('TRADE')}</Menu.Item>
      </Menu>

      <div style={{ paddingLeft: 10, paddingRight: 10 }}>
        <LanguageSelector />
      </div>

      {connected && (
        <div>
          <Popover
            content={<Settings autoApprove={wallet?.autoApprove} />}
            placement="bottomRight"
            title="Settings"
            trigger="click"
          >
            <Button
              style={{
                marginRight: 8,
                color: '#9999ff',
              }}
            >
              <SettingOutlined />
              Settings
            </Button>
          </Popover>
        </div>
      )}

      <div>
        <Select
          onSelect={setEndpoint}
          value={endpoint}
          style={{ marginRight: 8, color: '#9999ff', borderColor: '#9999ff' }}
        >
          {ENDPOINTS.map(({ name, endpoint }) => (
            <Select.Option value={endpoint} key={endpoint}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        <Select
          onSelect={setProvider}
          value={providerUrl}
          style={{ color: '#9999ff', borderColor: '#9999ff' }}
        >
          {WALLET_PROVIDERS.map(({ name, url }) => (
            <Select.Option value={url} key={url}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <Button
          type="text"
          size="middle"
          onClick={connected ? wallet.disconnect : wallet.connect}
          style={{ color: '#9999ff', borderColor: '#9999ff' }}
        >
          {!connected ? t('Connect wallet') : 'Disconnect'}
        </Button>
        {connected && (
          <Popover
            content={<LinkAddress address={publicKey} />}
            placement="bottomRight"
            title="Wallet public key"
            trigger="click"
          >
            <InfoCircleOutlined style={{ color: 'white' }} />
          </Popover>
        )}
      </div>
    </Wrapper>
  );
}
