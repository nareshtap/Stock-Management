import { StockDataItem } from '@app/types/stockData';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: StockDataItem[];
}

export default function LineChart({ data }: LineChartProps) {

  const [loadingData, setLoadingData] = useState(false)
 
  
    /**
   * Prepares the chart data, including labels and datasets for the line chart.
   * This is memoized to avoid unnecessary recalculations when the data doesn't change.
   */
  const chartData = useMemo(() => ({
  labels: data?.map((item) => new Date(item.datetime).toLocaleDateString()),
  datasets: [
    {
      label: 'End Price',
      data: data?.map((item) => item.endprice),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'Highest Price',
      data: data?.map((item) => item.highestprice),
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    },
    {
      label: 'Lowest Price',
      data: data?.map((item) => item.lowestprice),
      fill: false,
      borderColor: 'rgb(153, 102, 255)',
      tension: 0.1,
    },
  ],
}), [data]);

  /**
   * Sets the loading state to true when the chartData is updated.
   * This will trigger the "Loading Chart" text until the chart is ready to render.
   */
  useEffect(()=>{
    setLoadingData(true)

  }, [chartData])

  return (
    <div className="flex justify-center items-center h-[400px] w-[100%]">
     {loadingData ? ( <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false, 
          layout: {
          padding: {
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
      },
      }}}
      height={400}
      width={600}
  />) : <div>Loading Chart</div>
    }
    </div>
  );
}
