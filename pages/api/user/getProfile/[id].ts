import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

interface GetProfileParams {
  id?: number;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id: userId },
    session: { user },
  } = req;

  if (Array.isArray(userId)) {
    return res.json({
      ok: false,
      error: "Invalid user id",
    });
  }

  if (req.method === "GET") {
    const user = await client.user.findUnique({
      where: { id: Number(userId) },
    });
    res.json({
      ok: true,
      user,
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
