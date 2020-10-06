import { useAsyncData } from './fetch-loop';
import { useMarket } from './markets';
import tuple from 'immutable-tuple';

const SERUM__TRADES = 'https://serum-api.bonfida.com/trades/';

const _FAST_REFRESH_INTERVAL = 1000;

export async function apiGet(path) {
  try {
    let response = await fetch(path);
    if (!response.ok) {
      return [];
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export function _useUnfilteredTrades() {
  const { market, marketName } = useMarket();

  const getTrades = async () => {
    const results = await apiGet(
      SERUM__TRADES + marketName?.split('/').join(''),
    );
    return results.data;
  };

  const [trades] = useAsyncData(
    getTrades,
    tuple('getUnfilteredTrades', market),
    { refreshInterval: _FAST_REFRESH_INTERVAL },
  );

  if (!trades) {
    return null;
  }

  return trades;
  // NOTE: For now, websocket is too expensive since the event queue is large
  // and updates very frequently

  // let data = useAccountData(market && market._decoded.eventQueue);
  // if (!data) {
  //   return null;
  // }
  // const events = decodeEventQueue(data, limit);
  // return events
  //   .filter((event) => event.eventFlags.fill && event.nativeQuantityPaid.gtn(0))
  //   .map(market.parseFillEvent.bind(market));
}

export function useTradesCustom() {
  const trades = _useUnfilteredTrades();
  if (!trades) {
    return null;
  }
  // Until partial fills are each given their own fill, use maker fills
  return trades;
}
