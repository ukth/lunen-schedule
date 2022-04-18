import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const ipAddress = req.socket.remoteAddress;
    // console.log(req.socket);
    // console.log(ipAddress);

    // console.log("req.headers", req.headers);
    // console.log('req.headers["x-real-ip"]', req.headers["x-real-ip"]);
    // console.log(
    //   'req.headers["x-forwarded-for"]',
    //   req.headers["x-forwarded-for"]
    // );
    // //@ts-ignore
    // console.log("req", req);
    // console.log("req.connection?.remoteAddress", req.connection?.remoteAddress);
    const a = JSON.stringify(req);

    res.json({
      ok: true,
      ipAddress,
      req: a,
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
