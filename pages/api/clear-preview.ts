import type { NextApiRequest, NextApiResponse } from 'next'

export function handler(req: NextApiRequest, res: NextApiResponse) {
  res.clearPreviewData()
  res.end('preview mode disabled')
}

export default handler
