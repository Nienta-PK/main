import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import withAuth from '../hoc/withAuth';

function ChartPage() {
  return (
    <BarChart
      xAxis={[{ scaleType: 'band', data: ['Item Availability'] }]}
      series={[{ data: [4] }, { data: [1] }, { data: [2] }, { data: [3] }]}
      width={600}
      height={300}
    />
  );
}

export default withAuth(ChartPage);
export async function getServerSideProps(context) {
  return {
    props: {},
  };
}