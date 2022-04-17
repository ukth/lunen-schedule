import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const schedules = await client.schedule.findMany({
      where: { userId: req.session.user?.id },
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
