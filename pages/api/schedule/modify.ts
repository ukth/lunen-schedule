import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { OFFICE_IP_ADDRESSES, TYPE_OFFICE, TYPE_OUTSIDE } from "@constants";
import { ScheduleType } from "@prisma/client";

interface ModifyParams {
  scheduleId: number;
  startedAt?: Date;
  finishedAt?: Date;
}

interface ModifyData {
  modified: boolean;
  startedAt?: Date;
  finishedAt?: Date;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { scheduleId, startedAt, finishedAt }: ModifyParams = req.body;

  if (!(finishedAt || startedAt)) {
    return res.json({
      ok: true,
    });
  }

  if (!req.session.user) {
    return res.json({
      ok: false,
      error: "user not found",
    });
  }

  const schedule = await client.schedule.findUnique({
    where: {
      id: scheduleId,
    },
  });

  if (!schedule) {
    return res.json({
      ok: false,
      error: "schedule not found",
    });
  }

  if (schedule.userId !== req.session.user.id) {
    return res.json({
      ok: false,
      error: "You can modify your own schedule only.",
    });
  }

  let data: ModifyData = {
    modified: true,
  };

  if (startedAt) {
    data.startedAt = startedAt;
  }
  if (finishedAt) {
    data.finishedAt = finishedAt;
  }

  const modified = await client.schedule.update({
    where: {
      id: scheduleId,
    },
    data,
  });

  if (modified) {
    return res.json({
      ok: true,
    });
  } else {
    return res.json({
      ok: false,
      error: "Schedule not modified!",
    });
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
