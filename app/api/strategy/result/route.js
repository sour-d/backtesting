import result from "@/result/backtest.json";

export async function GET() {
  return Response.json({
    success: true,
    message: "Strategy result",
    data: result,
  });
}
