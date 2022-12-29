import 'dotenv/config'

// import { unstable_getServerSession } from 'next-auth/next'
// import { authOptions } from '../../auth/[...nextauth]'
import mailjet from '../mailjetHelper'

// limit subscriber count & email sending count

const unsubscribe = async (req, res) => {
  const LIST_ID = req.headers['x-newsletter-list-id'] || process.env.MAILJET_LIST_ID
  const { email } = req.query

  const status = await mailjet.unsubscribeFromList(decodeURI(email), LIST_ID)
  let result = status === 200
    ? 'success'
    : status === 404
      ? 'not_found'
      : 'error'

  const redirectUri = `${process.env.DOMAIN}/unsubscribe?result=${result}`

  res.redirect(303, redirectUri)
}

// HANDLER
export default async function handler(req, res) {
  if (req.method === 'GET' && req.query['blog-id'] && req.query.email) {
    await unsubscribe(req, res)
  } else {
    res.status(404).json({
      status: 404,
      message: 'Not Found'
    })
  }
}
