export async function GET() {
  return Response.json({
    success: true,
    message: "Pong",
    data: "Pong",
  });
}
