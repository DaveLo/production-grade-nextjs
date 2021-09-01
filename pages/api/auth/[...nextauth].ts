import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import type { NextApiHandler } from 'next'
import { connectToDB, doc, folder } from '../../../db'

export const auth: NextApiHandler = (req, res) =>
  NextAuth(req, res, {
    session: { jwt: true },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    providers: [
      Providers.GitHub({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
    ],
    database: process.env.DATABASE_URL,
    pages: {
      signIn: '/signin',
    },
    callbacks: {
      session(session, token) {
        if (token) {
          session.user = token
        }

        return session
      },
      async jwt(tokenPayload, user, account, profile, isNewUser) {
        const { db } = await connectToDB()

        if (isNewUser) {
          const createdBy = `${user.id}`
          const personalFolder = await folder.createFolder(db, { createdBy, name: 'Getting Started' })
          await doc.createDoc(db, {
            name: 'Start Here',
            folder: personalFolder._id,
            createdBy,
            content: {
              time: 1556098174501,
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Some default content',
                    level: 2,
                  },
                },
              ],
              version: '2.12.4',
            },
          })
        }
        if (tokenPayload && user) {
          return { ...tokenPayload, id: `${user.id}` }
        }

        return tokenPayload
      },
    },
  })

export default auth
