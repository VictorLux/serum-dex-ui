import React from 'react';
import { Switch, Typography } from 'antd';
import { usePreferences } from '../utils/preferences';

const { Paragraph } = Typography;

export default function Settings({ autoApprove }) {
  const { autoSettleEnabled, setAutoSettleEnabled } = usePreferences();

  return (
    <div>
      <Switch
        disabled={!autoApprove}
        checked={autoApprove && autoSettleEnabled}
        onChange={setAutoSettleEnabled}
        style={{
          marginRight: 10,
          background:
            autoApprove && autoSettleEnabled
              ? 'linear-gradient(90deg, rgba(51,51,255,1) 0%, rgba(128,128,255,1) 100%)'
              : 'rgb(85,86,96)',
        }}
      />{' '}
      Auto settle
      {!autoApprove && (
        <Paragraph style={{ color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
          To use auto settle, first enable auto approval in your wallet
        </Paragraph>
      )}
    </div>
  );
}
