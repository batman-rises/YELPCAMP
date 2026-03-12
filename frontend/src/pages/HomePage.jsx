import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Star, Users, Tent } from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1500534314209-a26db0f5f2e1?auto=format&fit=crop&w=1920&q=80'

const STATS = [
  { icon: Tent,   label: 'Campgrounds', value: '50+' },
  { icon: MapPin, label: 'States',      value: '15'  },
  { icon: Star,   label: 'Reviews',     value: '200+'},
  { icon: Users,  label: 'Explorers',   value: '1k+' },
]

const FEATURED = [
  {
    title: 'Pangong Lake Camp',
    location: 'Ladakh',
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
    price: '₹3,000',
  },
  {
    title: 'Spiti Cold Desert',
    location: 'Himachal Pradesh',
    img: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=80',
    price: '₹2,200',
  },
  {
    title: 'Jaisalmer Desert Camp',
    location: 'Rajasthan',
    img: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=600&q=80',
    price: '₹2,500',
  },
]

export default function HomePage() {
  return (
    <div className="font-body">

      {/* ─── Hero ─── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <img
          src={HERO_BG}
          alt="Campground in India"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950/80" />

        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
        />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-4 py-2 rounded-full mb-8">
            <MapPin size={13} className="text-sand-300" />
            Curated campgrounds across India
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6 text-white">
            Discover India's
            <span className="block italic font-light text-sand-300">
              Wild Escapes
            </span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            From Himalayan valleys to desert dunes — find, review, and share
            the finest camping spots across India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/campgrounds"
              className="flex items-center gap-2 bg-sand-400 hover:bg-sand-300 text-forest-900 font-semibold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lifted hover:shadow-lifted"
            >
              Explore Campgrounds
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/campgrounds/new"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/25 text-white px-7 py-3.5 rounded-full transition-all duration-200"
            >
              <Tent size={15} />
              Add Your Camp
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 text-xs">
          <span>Scroll to explore</span>
          <div className="w-px h-8 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-forest-800 py-12">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon size={20} className="text-sand-400 mx-auto mb-2" />
                <div className="font-display text-3xl text-white mb-1">{value}</div>
                <div className="text-white/50 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured ─── */}
      <section className="py-20 page-container">
        <div className="mb-12 text-center">
          <p className="text-forest-600 text-sm font-medium tracking-widest uppercase mb-3">Top Picks</p>
          <h2 className="section-title">Featured Campgrounds</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map(camp => (
            <div key={camp.title} className="card card-hover group">
              <div className="overflow-hidden h-52">
                <img
                  src={camp.img}
                  alt={camp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-forest-900">{camp.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <MapPin size={13} />
                      {camp.location}
                    </div>
                  </div>
                  <span className="font-semibold text-forest-700 text-sm whitespace-nowrap">{camp.price}<span className="text-gray-400 font-normal">/night</span></span>
                </div>
                <Link
                  to="/campgrounds"
                  className="btn-outline mt-4 w-full flex items-center justify-center gap-1.5"
                >
                  View Details
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/campgrounds" className="btn-primary inline-flex items-center gap-2">
            View All Campgrounds
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="bg-forest-800 py-16 text-center text-white">
        <div className="page-container max-w-2xl mx-auto">
          <Tent size={36} className="text-sand-400 mx-auto mb-5" />
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Know a hidden gem?
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Share it with the community and help fellow explorers discover India's best camping spots.
          </p>
          <Link to="/campgrounds/new" className="inline-flex items-center gap-2 bg-sand-400 hover:bg-sand-300 text-forest-900 font-semibold px-7 py-3.5 rounded-full transition-all">
            Add a Campground
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer inline for home */}
      <footer className="bg-forest-900 text-white/50 py-6 text-center text-sm">
        &copy; {new Date().getFullYear()} LetsCamp — Crafted for explorers
      </footer>
    </div>
  )
}
