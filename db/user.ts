import { Db } from 'mongodb'

export const getUserById = async (db: Db, id: string) => {
  const user = await db.collection('users').findOne({ _id: id })
  console.log(user)
  return user
}
