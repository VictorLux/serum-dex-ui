import React from 'react';
import { Layout, Row, Col, Grid } from 'antd';
import Link from './Link';
import { helpUrls } from './HelpUrls';
const { Footer } = Layout;
const { useBreakpoint } = Grid;

const footerElements = [
  {
    description: 'Serum Developer Resources',
    link: helpUrls.developerResources,
  },
  { description: 'Discord', link: helpUrls.discord },
  { description: 'Telegram', link: helpUrls.telegram },
  { description: 'GitHub', link: helpUrls.github },
  { description: 'Project Serum', link: helpUrls.projectSerum },
  { description: 'Solana Network', link: helpUrls.solanaBeach },
  { description: 'FTX', link: helpUrls.ftx },
  { description: 'Bonfida', link: 'https://bonfida.com' },
];

export const CustomFooter = () => {
  const smallScreen = !useBreakpoint().lg;

  return (
    <Footer
      style={{
        height: '45px',
        paddingBottom: 10,
        paddingTop: 10,
        background: '#0a0d1f',
        color: 'white',
      }}
    >
      <Row align="middle" gutter={[16, 4]}>
        {!smallScreen && (
          <>
            <Col flex="auto" />
            {footerElements.map((elem, index) => {
              return (
                <Col key={index + ''}>
                  <Link external to={elem.link} style={{ color: 'white' }}>
                    {elem.description}
                  </Link>
                </Col>
              );
            })}
          </>
        )}
        <Col flex="auto">{/*  <DexProgramSelector />*/}</Col>
      </Row>
    </Footer>
  );
};
