import { render, screen } from '@testing-library/react';
import React from 'react';
import LineChart from '../../app/components/LineChart';

jest.mock('react-chartjs-2', () => ({
  Line: ({ data }: any) => <div data-testid="mock-chart">{JSON.stringify(data)}</div>,
}));

describe('LineChart Component', () => {
  const mockData = [
    { datetime: '2024-01-01T00:00:00Z', endprice: 100, highestprice: 105, lowestprice: 95 },
    { datetime: '2024-01-02T00:00:00Z', endprice: 102, highestprice: 107, lowestprice: 97 },
    { datetime: '2024-01-03T00:00:00Z', endprice: 104, highestprice: 110, lowestprice: 98 },
  ];

  it('should render LineChart with correct data', () => {
    render(<LineChart data={mockData} />);

    const chartElement = screen.getByTestId('mock-chart');
    expect(chartElement).toBeInTheDocument();

    const chartData = JSON.parse(chartElement.textContent || '{}');
    expect(chartData.labels).toEqual([
      '1/1/2024',
      '1/2/2024',
      '1/3/2024',
    ]); 

    expect(chartData.datasets).toHaveLength(3); 

  
    expect(chartData.datasets[0].data).toEqual([100, 102, 104]); 
    expect(chartData.datasets[1].data).toEqual([105, 107, 110]);  
    expect(chartData.datasets[2].data).toEqual([95, 97, 98]);
  });

  it('should render with correct labels for datasets', () => {
    render(<LineChart data={mockData} />);

    const chartElement = screen.getByTestId('mock-chart');
    const chartData = JSON.parse(chartElement.textContent || '{}');

    expect(chartData.datasets[0].label).toBe('End Price');
    expect(chartData.datasets[1].label).toBe('Highest Price');
    expect(chartData.datasets[2].label).toBe('Lowest Price');
  });
});
