import type { NextApiRequest, NextApiResponse } from 'next'

export function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setPreviewData({})
  const route = req.query.route
  if (Array.isArray(route)) {
    throw new Error('route must be string')
  }
  res.redirect(route)
}

export default handler
