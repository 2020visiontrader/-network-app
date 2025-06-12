'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

/**
 * NoSSR wrapper to prevent hydration mismatches
 * Use this for components that have browser-specific behavior
 * or when browser extensions might interfere with SSR
 */
function NoSSRWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
})

export default NoSSR

/**
 * Higher-order component to wrap any component with NoSSR
 */
export function withNoSSR<P extends object>(Component: ComponentType<P>) {
  const WrappedComponent = (props: P) => (
    <NoSSR>
      <Component {...props} />
    </NoSSR>
  )
  
  WrappedComponent.displayName = `withNoSSR(${Component.displayName || Component.name})`
  
  return WrappedComponent
}
