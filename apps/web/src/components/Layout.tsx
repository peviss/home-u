import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="logo">
            Home<span className="logo-accent">U</span>
          </Link>
          <nav className="site-nav">
            <Link to="/">Browse</Link>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} HomeU · Sample listings</p>
      </footer>
    </div>
  )
}
