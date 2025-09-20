import fs from "fs";

export function Result(req, res) {
  const filename = req.nextUrl.searchParams.get("filename");

  const data = fs.readFileSync(
    `${process.env.RESULT_OUTPUT_DIR}/${filename}.json`,
    "utf-8"
  );
  return res.json({
    success: true,
    message: "Strategy result",
    data: JSON.parse(data),
  });
}
