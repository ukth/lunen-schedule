import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

interface GetSchedulesParams {
  id?: number;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
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

    const schedules = await client.schedule.findMany({
      where: {
        userId: Number(userId),
      },
      orderBy: [
        {
          startedAt: "desc",
        },
      ],
      take: 20,
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
