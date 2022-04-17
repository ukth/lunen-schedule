import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import bcrypt from "bcrypt";

// mail.setApiKey(process.env.SENDGRID_KEY!);
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { username, password, name } = req.body;
  const existingUser = await client.user.findFirst({
    where: {
      username,
    },
  });
  if (existingUser) {
    return res.status(400).json({
      error: "existing username",
      ok: false,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await client.user.create({
    data: {
      username,
      name,
      password: hashedPassword,
    },
  });
  if (user) {
    return res.json({
      ok: true,
    });
  } else {
    return res.json({
      ok: false,
    });
  }
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
