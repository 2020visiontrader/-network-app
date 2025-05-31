import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealTimeUpdateOptions {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onUpdate?: (payload: any) => void
  showToast?: boolean
}

interface ToastNotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
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

  const addNotification = useCallback((message: string, type: ToastNotification['type'] = 'info') => {
    const notification: ToastNotification = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now()
    }

    setNotifications(prev => [...prev, notification])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const getEventMessage = useCallback((tableName: string, eventType: string, payload: any) => {
    const tableDisplayNames: Record<string, string> = {
      coffee_chats: 'Coffee Chat',
      events: 'Event',
      connections: 'Connection',
      masterminds: 'Mastermind',
      announcements: 'Announcement',
      usage_metrics: 'Activity'
    }

    const displayName = tableDisplayNames[tableName] || tableName

    switch (eventType) {
      case 'INSERT':
        return `New ${displayName} added — click to refresh`
      case 'UPDATE':
        return `${displayName} updated — click to refresh`
      case 'DELETE':
        return `${displayName} removed — click to refresh`
      default:
        return `${displayName} changed — click to refresh`
    }
  }, [])

  useEffect(() => {
    if (!table) return

    // Create channel name
    const channelName = `realtime:${table}${filter ? `:${filter}` : ''}`

    // Create subscription
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter
        } as any,
        (payload: any) => {
          console.log('Real-time update received:', payload)

          // Call custom handler if provided
          if (onUpdate) {
            onUpdate(payload)
          }

          // Show toast notification
          if (showToast) {
            const message = getEventMessage(table, payload.eventType || 'UPDATE', payload)
            addNotification(message, 'info')
          }
        }
      )
      .subscribe((status: any) => {
        console.log('Subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    setChannel(subscription)

    // Cleanup on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, event, filter, onUpdate, showToast, getEventMessage, addNotification])

  // Manual refresh function
  const refresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  return {
    isConnected,
    notifications,
    removeNotification,
    refresh,
    channel
  }
}

// Specialized hooks for common use cases
export function useCoffeeChatUpdates(onUpdate?: (payload: any) => void) {
  return useRealTimeUpdate({
    table: 'coffee_chats',
    onUpdate,
    showToast: true
  })
}

export function useEventUpdates(onUpdate?: (payload: any) => void) {
  return useRealTimeUpdate({
    table: 'events',
    onUpdate,
    showToast: true
  })
}

export function useConnectionUpdates(userId?: string, onUpdate?: (payload: any) => void) {
  return useRealTimeUpdate({
    table: 'connections',
    filter: userId ? `initiator_id=eq.${userId},receiver_id=eq.${userId}` : undefined,
    onUpdate,
    showToast: true
  })
}

export function useMastermindUpdates(onUpdate?: (payload: any) => void) {
  return useRealTimeUpdate({
    table: 'masterminds',
    onUpdate,
    showToast: true
  })
}

export function useAnnouncementUpdates(onUpdate?: (payload: any) => void) {
  return useRealTimeUpdate({
    table: 'announcements',
    event: 'INSERT',
    onUpdate,
    showToast: true
  })
}

// Toast notification component hook
export function useToastNotifications() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const addToast = useCallback((message: string, type: ToastNotification['type'] = 'info') => {
    const toast: ToastNotification = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now()
    }

    setToasts(prev => [...prev, toast])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  }
}

// Connection status hook
export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('users').select('count').limit(1)
        setIsConnected(!error)
      } catch (error) {
        console.error('Connection check failed:', error)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isConnected, isLoading }
}
