import 'dotenv/config'

import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

// limit subscriber count & email sending count

const createSubscriber = async (req, res) => {
  // get list of blog

  // https://dev.mailjet.com/email/guides/contact-management/
  // create contact
  // add contact to list

  res.status(201).json()
}

const checkAuth = (session, id) =>
  session && session.user && session.user.name === id

// HANDLER
export default async function handler(req, res) {
  const userSession = await unstable_getServerSession(req, res, authOptions)
  const isAuthorized = checkAuth(userSession, req.query['blog-id'])

  // only allow post for unuauthorized users
  if (req.method !== 'POST' && (!isAuthorized || !req.query['blog-id'])) {
    res.status(401).json();
  } else {
    if (req.method === 'POST' && req.query['blog-id']) {
      console.log('TODO create sub', req.query['blog-id'], req.body)
      res.status(201).json({ message:'success' })
    }
    if (req.method === 'GET') {
      console.log('TODO get subscriber info')
      res.status(200).json({ message:'success' })
    }
  }
}
