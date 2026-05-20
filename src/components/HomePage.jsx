import Navbar from './Navbar'
import Hero from './Hero'
import StatsBar from './StatsBar'
import HowItWorks from './HowItWorks'
import WhoItsFor from './WhoItsFor'
import Impact from './Impact'
import Footer from './Footer'

const HomePage = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <WhoItsFor />
        <Impact />
      </main>
      <Footer />
    </>
  )
}

export default HomePage
