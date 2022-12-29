import 'dotenv/config'

// import { unstable_getServerSession } from 'next-auth/next'
// import { authOptions } from '../../auth/[...nextauth]'
import mailjet from '../mailjetHelper'

// limit subscriber count & email sending count

const addNewSubscriber = async (req, res) => {
  const LIST_ID = req.headers['x-newsletter-list-id'] || process.env.MAILJET_LIST_ID
  const { email } = req.body

  const existingSub = await mailjet.getSubscriber(email)

  const subscriber = existingSub && existingSub.Total > 0
    ? existingSub
    : await mailjet.createSubscriber(email)

  const subscriberId = subscriber.Data[0].ID

  await mailjet.addToList(subscriberId, LIST_ID)

  res.status(201).json({ success: true })
}

// HANDLER
export default async function handler(req, res) {
  if (req.method === 'POST' && req.query['blog-id']) {
    await addNewSubscriber(req, res)
  } else {
    res.status(404).json({
      status: 404,
      message: 'Not Found'
    })
  }
}
