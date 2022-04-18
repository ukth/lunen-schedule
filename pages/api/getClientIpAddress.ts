import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const ipAddress =
      req.headers["x-real-ip"] || req.headers["x-forwarded-for"];

    if (ipAddress) {
      res.json({
        ok: true,
        ipAddress,
      });
    } else {
      res.json({
        ok: false,
        error: "Invalid network access.",
      });
    }
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
