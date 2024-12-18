"use client";
import Loader from "@components/Loader";
import axiosInstance from "@lib/axiosInstance";
import { Suspense, useEffect, useState } from "react";
import { StockDataResponse } from "./types/stockData";
import dynamic from "next/dynamic";


const getStockData = async (): Promise<StockDataResponse> => {
  try {
    const response = await axiosInstance.get("/data-import");
    return response.data;
  } catch {
    return { data: [], totalRecords: 0 };
  }
};

const CollapsibleTable = dynamic(() => import("@components/Table"), {
  ssr: false, 
});


export default function Home() {
  const [data, setData] = useState<StockDataResponse>({
    data: [],
    totalRecords: 0,
  });

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Fetch the stock data and set it in state
    const fetchData = async () => {
      try {
        const result = await getStockData();
        setData(result);
      } catch {
        setIsError(true);
      }
    };

    fetchData();
  }, []);

  if (isError) {
    return <div>Error fetching stock data</div>;
  }

  return (
    <div>
      <Suspense fallback={<Loader />}>
        <CollapsibleTable rowData={data} />
      </Suspense>
    </div>
  );
}
