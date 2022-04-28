import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { OFFICE_IP_ADDRESSES, TYPE_OFFICE, TYPE_OUTSIDE } from "@constants";
import { ScheduleType } from "@prisma/client";

interface DeleteParams {
  scheduleId: number;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { scheduleId }: DeleteParams = req.body;

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
      error: "You can delete your own schedule only.",
    });
  }

  const deleted = await client.schedule.delete({
    where: {
      id: scheduleId,
    },
  });

  if (deleted) {
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
