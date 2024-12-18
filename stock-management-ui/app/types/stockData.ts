type StockDataHistory = {
  date: string;
  customerId: string;
  amount: number;
};

export type StockDataItem = {
  id: number;
  datatype: string;
  symbol: string;
  datetime: string;
  startprice?: number;
  highestprice?: number;
  lowestprice?: number;
  endprice?: number;
  volume?: number;
  source?: string;
  type?: string;
  currency?: string;
  metadata: Record<string, unknown>;
  history?: StockDataHistory[];
};

export type StockDataResponse = {
  data: StockDataItem[];
  totalRecords: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
};
