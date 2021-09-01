import { Db } from 'mongodb'
import { nanoid } from 'nanoid'

export interface Doc {
  _id?: string
  createdBy: string
  folder: string
  name: string
  content?: any
  createdAt?: string
}

export const getOneDoc = (db: Db, id: string) => db.collection('docs').findOne<Doc>({ _id: id })

export const getDocsByFolder = (db: Db, folderId: string) =>
  db.collection('docs').find<Doc>({ folder: folderId }).toArray()

export const createDoc = (db: Db, doc: Doc) =>
  db
    .collection('docs')
    .insertOne({
      _id: nanoid(12),
      ...doc,
      createdAt: new Date().toDateString(),
    })
    .then(({ ops }) => ops[0])

export const updateOne = async (db: Db, id: string, updates: Partial<Doc>) => {
  const operation = await db.collection('docs').updateOne({ _id: id }, { $set: updates })

  if (!operation.result.ok) {
    throw new Error('Could not update document')
  }

  const updated = await getOneDoc(db, id)
  return updated
}
