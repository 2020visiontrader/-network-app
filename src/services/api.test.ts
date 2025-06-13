import { describe, it, expect } from '@jest/globals'
import { createUser, updateUser, getUserById, submitFounderApplication, createNotification } from './api'
import type { Database } from '../../lib/database.types'

describe('API Service Tests', () => {
  const testUser: Database['public']['Tables']['founders']['Insert'] = {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    company_name: 'Test Company',
    role: 'CEO'
  }

  it('should create a user', async () => {
    const result = await createUser(testUser)
    expect(result).toBeDefined()
    expect(result?.email).toBe(testUser.email)
  })

  it('should update a user', async () => {
    const updates = { full_name: 'Updated User' }
    const result = await updateUser(testUser.id!, updates)
    expect(result).toBeDefined()
    expect(result?.full_name).toBe(updates.full_name)
  })

  it('should get a user by ID', async () => {
    const result = await getUserById(testUser.id!)
    expect(result).toBeDefined()
    expect(result?.id).toBe(testUser.id)
  })

  it('should submit a founder application', async () => {
    const applicationData = {
      email: testUser.email,
      full_name: testUser.full_name,
      company_name: 'Test Company',
      brief_description: 'Test description',
      linkedin_url: 'https://linkedin.com/in/test'
    }
    const result = await submitFounderApplication(applicationData)
    expect(result).toBe(true)
  })

  it('should create a notification', async () => {
    const notificationData = {
      founder_id: testUser.id!,
      title: 'Test Notification',
      body: 'This is a test notification.',
      type: 'system' as const
    }
    const result = await createNotification(notificationData)
    expect(result).toBe(true)
  })
})
