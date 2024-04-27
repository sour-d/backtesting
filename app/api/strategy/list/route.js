import strategies from "@/trading/strategy";

export async function GET() {
  const strategyWithConfig = {};
  strategies.forEach((strategy) => {
    strategyWithConfig[strategy.name] = strategy.getDefaultConfig();
  });
  return Response.json(strategyWithConfig);
}
