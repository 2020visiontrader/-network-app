import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RealTimeUpdateOptions {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
  showToast?: boolean
}

interface ToastNotification {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  createdAt: number
}

export function useRealTimeUpdate({
  table,
  event = '*',
  filter,
  onUpdate,
  showToast = true
}: RealTimeUpdateOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const reconnectAttempts = useRef(0)
  const maxAttempts = 5

  const addNotification = useCallback((message: string, type: ToastNotification['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifications(prev => [...prev, { id, message, type, createdAt: Date.now() }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const getEventMessage = useCallback((table: string, eventType: string, payload: any) => {
    switch (table) {
      case 'coffee_chats':
        return `Coffee chat ${eventType.toLowerCase()}ed`
      case 'connections':
        return `Connection ${eventType.toLowerCase()}ed`
      default:
        return `${table} ${eventType.toLowerCase()}ed`
    }
  }, [])

  const setupSubscription = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel)
    }

    const channelName = `realtime:${table}:v1${filter ? `:${filter}` : ''}`

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        { 
          event: event as any,
          schema: 'public',
          table,
          ...(filter ? { filter } : {})
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Realtime update received:', { channel: channelName, payload })

          if (onUpdate) {
            onUpdate(payload)
          }

          if (showToast) {
            const message = getEventMessage(table, payload.eventType || 'UPDATE', payload)
            addNotification(message, 'info')
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', { channel: channelName, status })
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          reconnectAttempts.current = 0
        } else {
          setIsConnected(false)
          
          // Handle reconnection for non-intentional disconnects
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            if (reconnectAttempts.current < maxAttempts) {
              const attempt = reconnectAttempts.current + 1
              reconnectAttempts.current = attempt
              const delay = Math.min(1000 * Math.exp(attempt), 30000)
              console.log(`Attempting to reconnect in ${delay}ms (attempt ${attempt})`)
              setTimeout(setupSubscription, delay)
            } else {
              console.error('Max reconnection attempts reached')
              addNotification('Lost connection to real-time updates', 'error')
            }
          }
        }
      })

    setChannel(subscription)
  }, [table, event, filter, onUpdate, showToast, getEventMessage, addNotification, channel, maxAttempts])

  useEffect(() => {
    setupSubscription()

    return () => {
      if (channel) {
        console.log('Cleaning up realtime subscription')
        supabase.removeChannel(channel)
      }
    }
  }, [channel, setupSubscription])

  const refresh = useCallback(() => {
    console.log('Manual refresh requested')
    setupSubscription()
  }, [setupSubscription])

  return {
    isConnected,
    notifications,
    removeNotification,
    refresh,
    channel
  }
}

// Specialized hooks for common use cases
export function useCoffeeChatUpdates(onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void) {
  return useRealTimeUpdate({
    table: 'coffee_chats',
    onUpdate
  })
}

export function useEventUpdates(onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void) {
  return useRealTimeUpdate({
    table: 'events',
    onUpdate
  })
}

export function useConnectionUpdates(userId?: string, onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void) {
  return useRealTimeUpdate({
    table: 'connections',
    filter: userId ? `initiator_id=eq.${userId},receiver_id=eq.${userId}` : undefined,
    onUpdate
  })
}

export function useMastermindUpdates(onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void) {
  return useRealTimeUpdate({
    table: 'masterminds',
    onUpdate
  })
}

export function useAnnouncementUpdates(onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void) {
  return useRealTimeUpdate({
    table: 'announcements',
    onUpdate
  })
}

// Enhanced connection status hook
export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const reconnectAttempts = useRef(0)
  const maxAttempts = 5

  useEffect(() => {
    let mounted = true
    const checkInterval = 30000 // 30 seconds

    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('founders').select('count').limit(1)
        if (mounted) {
          setIsConnected(!error)
          if (!error) {
            reconnectAttempts.current = 0
          }
        }
      } catch (error) {
        console.error('Connection check failed:', error)
        if (mounted) {
          setIsConnected(false)
          
          if (reconnectAttempts.current < maxAttempts) {
            const attempt = reconnectAttempts.current + 1
            reconnectAttempts.current = attempt
            const delay = Math.min(1000 * Math.exp(attempt), checkInterval)
            setTimeout(checkConnection, delay)
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, checkInterval)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { isConnected, isLoading }
}
