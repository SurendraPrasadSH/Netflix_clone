import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onSearch, searchQuery }) {
  const { user, logout }    = useAuth()
  const navigate            = useNavigate()
  const [searchOpen, setSO] = useState(false)
  const [showMenu,   setSM] = useState(false)
  const inputRef            = useRef(null)

  const handleLogout = async () => { await logout(); navigate('/', { replace: true }) }

  const toggleSearch = () => {
    setSO((o) => !o)
    if (!searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else onSearch('')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-black/90 to-transparent px-4 md:px-12 py-4 flex items-center justify-between">
      <span className="text-red-600 font-bold text-2xl md:text-3xl cursor-pointer select-none" onClick={() => onSearch('')}>
        NETFLIX
      </span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={toggleSearch} className="text-white hover:text-gray-300 transition" aria-label="Search">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {searchOpen && (
            <input ref={inputRef} type="text" placeholder="Titles, genres…" value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="bg-black/80 border border-white text-white text-sm px-3 py-1 rounded w-48 md:w-64 focus:outline-none"
            />
          )}
        </div>

        <div className="relative">
          <button onClick={() => setSM((s) => !s)} className="flex items-center gap-1.5 text-white hover:text-gray-300">
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 bg-zinc-900 border border-gray-700 rounded w-52 text-sm py-2 shadow-xl">
              <p className="px-4 py-2 text-gray-400 truncate">{user?.email}</p>
              <hr className="border-gray-700 my-1" />
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-zinc-800 transition">
                Sign out of Netflix
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
