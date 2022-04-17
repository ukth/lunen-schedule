import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { ScheduleType, TYPE_OFFICE } from "@constants";

interface ScheduleParams {
  type: ScheduleType;
  startedAt?: Date;
  modified?: boolean;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { type, startedAt, modified }: ScheduleParams = req.body;

  let data;

  if (!req.session.user) {
    return res.json({
      ok: false,
      error: "user not found",
    });
  }

  if (type === TYPE_OFFICE) {
    // ip validation
    data = {
      type,
      startedAt: new Date(),
      modified: false,
    };
  } else {
    return;
  }

  const newSchedule = await client.schedule.create({
    data: {
      ...data,
      user: {
        connect: {
          id: req.session.user.id,
        },
      },
    },
  });

  if (newSchedule) {
    return res.json({
      ok: true,
    });
  } else {
    return res.json({
      ok: false,
      error: "Schedule not created!",
    });
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
