import { createContext, MouseEvent, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

type RouterContextValue = {
  pathname: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

function normalizePath(to: string) {
  if (!to) return '/'
  const url = new URL(to, window.location.origin)
  return `${url.pathname}${url.search}${url.hash}`
}

export function RouterProvider({ children }: PropsWithChildren) {
  const [pathname, setPathname] = useState(() => `${window.location.pathname}${window.location.search}${window.location.hash}`)

  useEffect(() => {
    const onPopState = () => setPathname(`${window.location.pathname}${window.location.search}${window.location.hash}`)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo<RouterContextValue>(() => ({
    pathname,
    navigate: (to: string) => {
      const next = normalizePath(to)
      if (next === pathname) return
      window.history.pushState({}, '', next)
      setPathname(next)
    },
  }), [pathname])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouterContext() {
  const value = useContext(RouterContext)
  if (!value) throw new Error('Router hooks must be used inside RouterProvider')
  return value
}

export function usePathname() {
  return useRouterContext().pathname.split('?')[0].split('#')[0]
}

export function useNavigate() {
  return useRouterContext().navigate
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

export function Link({ href, onClick, target, ...props }: LinkProps) {
  const navigate = useNavigate()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      target === '_blank' ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return
    }

    event.preventDefault()
    navigate(href)
  }

  return <a {...props} href={href} target={target} onClick={handleClick} />
}
