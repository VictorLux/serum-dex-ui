import React from 'react';
import i18n from '../i18n/index.js';
import { flagIcon } from '../utils/flagIcons';
import { useTranslation } from 'react-i18next';
import { Select, Row, Col } from 'antd';
const { Option } = Select;

const availableLanguages = [
  { key: 'en', description: 'English' },
  { key: 'zh', description: 'Chinese Simplified' },
  { key: 'zh-Hant', description: 'Chinese Traditional' },
];

const onChange = (lng) => {
  i18n.changeLanguage(lng);
};

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const storedLocale = i18n.language || 'en';
  let defaultLanguage;
  availableLanguages.forEach((elem) => {
    if (storedLocale === elem.key) {
      defaultLanguage = elem.description;
    }
  });

  const defaultValue = (
    <Row align="middle" justify="space-between" gutter={[16, 4]}>
      <Col>{defaultLanguage}</Col>
      <Col>
        <img src={flagIcon(storedLocale)} height="10px" alt={storedLocale} />
      </Col>
    </Row>
  );

  return (
    <Select
      defaultValue={defaultValue}
      onChange={onChange}
      style={{ width: '190px', color: '#9999ff', borderColor: '#9999ff' }}
    >
      {availableLanguages.map((elem) => {
        return (
          <Option key={elem.key}>
            <Row align="middle" justify="space-between" gutter={[16, 4]}>
              <Col>{elem.description}</Col>
              <Col>
                <img
                  src={flagIcon(elem.key)}
                  height="10px"
                  alt={elem.key}
                  key={elem.key}
                />
              </Col>
            </Row>
          </Option>
        );
      })}
    </Select>
  );
};
