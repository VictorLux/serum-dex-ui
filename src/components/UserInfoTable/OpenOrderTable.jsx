import React, { useState } from 'react';
import DataTable from '../layout/DataTable';

import styled from 'styled-components';
import { Button, Row, Col, Tag } from 'antd';
import { cancelOrder } from '../../utils/send';
import { useWallet } from '../../utils/wallet';
import { useSendConnection } from '../../utils/connection';
import { notify } from '../../utils/notifications';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const CancelButton = styled(Button)`
  color: #f23b69;
  border: 1px solid #f23b69;
  &:hover {
    background: #f23b69;
    color: unset;
  }
`;

export default function OpenOrderTable({ openOrders, onCancelSuccess }) {
  let { wallet } = useWallet();
  let connection = useSendConnection();

  const { t } = useTranslation();

  const [cancelId, setCancelId] = useState(null);

  async function cancel(order) {
    setCancelId(order?.orderId);
    try {
      await cancelOrder({
        order,
        market: order.market,
        connection,
        wallet,
      });
    } catch (e) {
      notify({
        message: 'Error cancelling order',
        description: e.message,
        type: 'error',
      });
      return;
    } finally {
      setCancelId(null);
    }
    onCancelSuccess && onCancelSuccess();
  }

  const columns = [
    {
      title: t('Market'),
      dataIndex: 'marketName',
      key: 'marketName',
    },
    {
      title: t('Side'),
      dataIndex: 'side',
      key: 'side',
      render: (side) => (
        <Tag
          color={side === 'buy' ? '#41C77A' : '#F23B69'}
          style={{ fontWeight: 700 }}
        >
          {side.charAt(0).toUpperCase() + side.slice(1)}
        </Tag>
      ),
    },
    {
      title: t('Size'),
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: t('Price'),
      dataIndex: 'price',
      key: 'price',
    },
    {
      key: 'orderId',
      render: (order) => (
        <div style={{ textAlign: 'right' }}>
          <CancelButton
            icon={<DeleteOutlined />}
            onClick={() => cancel(order)}
            loading={cancelId + '' === order?.orderId + ''}
          >
            Cancel
          </CancelButton>
        </div>
      ),
    },
  ];
  const dataSource = (openOrders || []).map((order) =>
    Object.assign(order, { key: order.orderId }),
  );

  return (
    <Row>
      <Col span={24}>
        <DataTable
          emptyLabel={t('No open orders')}
          dataSource={dataSource}
          columns={columns}
          pagination={true}
          pageSize={5}
        />
      </Col>
    </Row>
  );
}
