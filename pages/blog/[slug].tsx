import React, { FC } from 'react'
import hydrate from 'next-mdx-remote/hydrate'
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Post } from '../../types'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import renderToString from 'next-mdx-remote/render-to-string'
import { posts as postsFromCMS } from '../../content'
import { GetStaticPaths, GetStaticProps } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const postsPath = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postsPath)
  const slugs = filenames.map((name) => {
    const filepath = path.join(postsPath, name)
    const file = fs.readFileSync(filepath, 'utf-8')
    const { data } = matter(file)
    return data
  })

  return { paths: slugs.map((s) => ({ params: { slug: s.slug } })), fallback: true }
}

export const getStaticProps: GetStaticProps = async ({ params, preview }) => {
  let post
  try {
    const postsPath = path.join(process.cwd(), 'posts', params.slug + '.mdx')
    post = fs.readFileSync(postsPath, 'utf-8')
  } catch (err) {
    const cmsPosts = (preview ? postsFromCMS.draft : postsFromCMS.published).map((p) => {
      return matter(p)
    })
    const match = cmsPosts.find((p) => p.data.slug === params.slug)
    post = match.content
  }
  const { data } = matter(post)
  const mdxSource = await renderToString(post, { scope: data })
  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  }
}

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  const content = hydrate(source)
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    )
  }
  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content}</Pane>
        </Container>
      </main>
    </Pane>
  )
}

BlogPost.defaultProps = {
  source: '',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
}

/**
 * Need to get the paths here
 * then the the correct post for the matching path
 * Posts can come from the fs or our CMS
 */
export default BlogPost
