import React, { FC, useState } from 'react'
import { Pane, Dialog, majorScale, FolderSharedOpenIcon } from 'evergreen-ui'
import { useRouter } from 'next/router'
import Logo from '../../components/logo'
import FolderList from '../../components/folderList'
import NewFolderButton from '../../components/newFolderButton'
import User from '../../components/user'
import FolderPane from '../../components/folderPane'
import DocPane from '../../components/docPane'
import NewFolderDialog from '../../components/newFolderDialog'
import type { GetServerSideProps } from 'next'
import { getSession, useSession } from 'next-auth/client'
import type { UserSession } from '../../types'
import { folder, doc, connectToDB } from '../../db'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)
  console.log(JSON.stringify({ step: 'ssp', session }))
  if (!session || !session.user?.name) {
    return { props: { session } }
  }
  const props: any = { session }

  const { db } = await connectToDB()
  const folders = await folder.getFolders(db, session.user.id)
  props.folders = folders

  if (ctx.params?.id?.length > 0) {
    const activeFolder = folders.find((f) => f._id === ctx.params.id[0])
    const activeDocs = await doc.getDocsByFolder(db, activeFolder._id)
    props.activeFolder = activeFolder
    props.activeDocs = activeDocs

    const activeDocId = ctx.params.id[1]

    if (activeDocId) {
      props.activeDoc = await doc.getOneDoc(db, activeDocId)
    }
  }
  console.log(props)
  return { props }
}

const App: FC<{ folders?: any[]; activeFolder?: any; activeDoc?: any; activeDocs?: any[] }> = ({
  folders = [],
  activeDoc,
  activeFolder,
  activeDocs,
}) => {
  const router = useRouter()
  const [session, loading] = useSession()
  const [newFolderIsShown, setIsShown] = useState(false)
  const [allFolders, setFolders] = useState(folders)

  const handleNewFolder = async (name: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/folder/`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const { data } = await res.json()

    setFolders((state) => [...state, data])
  }

  if (loading) {
    return null
  }

  const Page = () => {
    if (activeDoc) {
      return <DocPane folder={activeFolder} doc={activeDoc} />
    }

    if (activeFolder) {
      return <FolderPane folder={activeFolder} docs={activeDocs} />
    }

    return null
  }

  if (!loading && !session) {
    return (
      <Dialog
        isShown
        title="Session expired"
        confirmLabel="Ok"
        hasCancel={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        onConfirm={() => router.push('/signin')}
      >
        Sign in to continue
      </Dialog>
    )
  }

  return (
    <Pane position="relative">
      <Pane width={300} position="absolute" top={0} left={0} background="tint2" height="100vh" borderRight>
        <Pane padding={majorScale(2)} display="flex" alignItems="center" justifyContent="space-between">
          <Logo />

          <NewFolderButton onClick={() => setIsShown(true)} />
        </Pane>
        <Pane>
          <FolderList folders={allFolders} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page />
      </Pane>
      <NewFolderDialog close={() => setIsShown(false)} isShown={newFolderIsShown} onNewFolder={handleNewFolder} />
    </Pane>
  )
}

App.defaultProps = {
  folders: [],
}

/**
 * Catch all handler. Must handle all different page
 * states.
 * 1. Folders - none selected
 * 2. Folders => Folder selected
 * 3. Folders => Folder selected => Document selected
 *
 * An unauth user should not be able to access this page.
 *
 * @param context
 */
export default App
