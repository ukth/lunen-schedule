import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const {
      query: { id: userId },
      session: { user },
    } = req;

    if (!Number.isInteger(+userId)) {
      return res.json({
        ok: false,
        error: "Invalid user id",
      });
    }

    const schedules = await client.schedule.findMany({
      where: {
        userId: +userId,
        startedAt: {
          gt: new Date(new Date().valueOf() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: [
        {
          startedAt: "desc",
        },
      ],
      take: 50,
    });

    return res.json({
      ok: true,
      schedules: schedules.map((schedule) => ({
        ...schedule,
        startedAt: schedule.startedAt.valueOf(),
        finishedAt: schedule.finishedAt?.valueOf() ?? null,
      })),
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
