import { Link } from 'react-router-dom'
import { Tent, Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white/60 mt-20">
      <div className="page-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-forest-700 p-1.5 rounded-lg">
              <Tent size={18} className="text-sand-300" />
            </div>
            <span className="font-display text-lg text-white/90">LetsCamp</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/campgrounds" className="hover:text-white transition-colors">Campgrounds</Link>
            <Link to="/campgrounds/new" className="hover:text-white transition-colors">Add Campground</Link>
            <Link to="/favorites" className="hover:text-white transition-colors">Favorites</Link>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <span>Crafted with</span>
            <Heart size={13} className="text-sand-400 fill-sand-400" />
            <span>for explorers &bull; &copy; {new Date().getFullYear()} LetsCamp</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
