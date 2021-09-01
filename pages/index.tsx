import React, { FC } from 'react'
import { Pane, majorScale } from 'evergreen-ui'
import Container from '../components/container'
import Hero from '../components/hero'
import HomeNav from '../components/homeNav'
import FeatureSection from '../components/featureSection'
import { home } from '../content'
import { GetStaticProps } from 'next'

interface HomeProps {
  content: { hero: any; features: any[] }
}
export const getStaticProps: GetStaticProps = async (ctx) => {
  const content = ctx.preview ? home.draft : home.published
  return { props: { content } }
}

const Home: FC<HomeProps> = ({ content }) => {
  return (
    <Pane>
      <header>
        <HomeNav />
        <Container>
          <Hero content={content.hero} />
        </Container>
      </header>
      <main>
        {content.features.map((feature, i) => (
          <FeatureSection
            key={feature.title}
            title={feature.title}
            body={feature.body}
            image="/docs.png"
            invert={i % 2 === 0}
          />
        ))}
      </main>
      <footer>
        <Pane background="overlay" paddingY={majorScale(9)}>
          <Container>hello</Container>
        </Pane>
      </footer>
    </Pane>
  )
}

export default Home
