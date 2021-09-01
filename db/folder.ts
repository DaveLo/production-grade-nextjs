import { Db } from 'mongodb'
import { nanoid } from 'nanoid'

export interface Folder {
  _id?: string
  createdBy: string
  name: string
  createdAt?: string
}
export const createFolder = async (db: Db, folder: Folder) => {
  const newFolder = await db.collection('folders').insertOne({
    _id: nanoid(12),
    ...folder,
    createdAt: new Date().toDateString(),
  })
  console.log(newFolder)
  return newFolder.ops[0]
}

export const getFolders = (db: Db, userId: string) =>
  db.collection('folders').find<Folder>({ createdBy: userId }).toArray()
