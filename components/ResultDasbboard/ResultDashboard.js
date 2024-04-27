import { BarChart } from "@mui/x-charts/BarChart";

export default function ResultDashboard({ info, data }) {
  console.log("inside ResultDashboard", data);
  return (
    <div style={{ width: "100%", overflow: "auto" }}>
      <BarChart
        height={500}
        dataset={data}
        series={[{ scaleType: "band", dataKey: "profitOrLoss" }]}
        xAxis={[{ dataKey: "id", scaleType: "band" }]}
        tooltip={{ show: false }}
      />
    </div>
  );
}
