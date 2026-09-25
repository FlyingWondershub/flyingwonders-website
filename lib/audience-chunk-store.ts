import { createClient } from 'next-sanity'
import crypto from 'crypto'
import { apiVersion, dataset, projectId } from '../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export interface SubscriberItem {
  id: string
  email: string
  name?: string
  company?: string
  audienceType?: 'b2b' | 'b2c' | 'lead'
  source?: string
  isActive: boolean
  subscribedAt?: string
  _createdAt?: string
}

export interface MarketingLeadItem {
  id: string
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  city?: string
  designation?: string
  accreditations?: string
  priority?: string
  leadType?: string
  status?: string
  source?: string
  relevantKeywords?: string
  notes?: string
  _createdAt?: string
  _updatedAt?: string
}

const CHUNK_MAX_SIZE = 500

// ═══════════════════════════════════════════════════════════════════════════
// 1. SUBSCRIBERS STORE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all subscribers across all chunks.
 */
export async function getAllSubscribers(full: boolean = true): Promise<SubscriberItem[] | string[]> {
  try {
    const chunks = await writeClient.fetch<Array<{ subscribers: SubscriberItem[] }>>(
      `*[_type == "newsletterSubscriberChunk"] | order(chunkIndex asc) { subscribers }`
    )

    if (chunks && chunks.length > 0) {
      const all: SubscriberItem[] = []
      for (const c of chunks) {
        if (Array.isArray(c.subscribers)) {
          all.push(...c.subscribers)
        }
      }
      if (!full) {
        return all.filter(s => s.isActive).map(s => s.email)
      }
      return all
    }
  } catch (e) {
    console.error('Error fetching subscriber chunks from Sanity, using local store:', e)
  }

  // Fallback to local prepared chunks
  try {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'prepared_subscriber_chunks.json')
    if (fs.existsSync(filePath)) {
      const subChunks = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const all: SubscriberItem[] = []
      for (const c of subChunks) {
        if (Array.isArray(c.subscribers)) {
          all.push(...c.subscribers)
        }
      }
      if (!full) {
        return all.filter(s => s.isActive).map(s => s.email)
      }
      return all
    }
  } catch (err) {
    console.error('Fallback subscriber read error:', err)
  }

  return []
}

/**
 * Get active subscriber count directly.
 */
export async function getActiveSubscriberCount(): Promise<number> {
  try {
    const count = await writeClient.fetch<number>(
      `count(*[_type == "newsletterSubscriberChunk"].subscribers[isActive == true])`
    )
    if (typeof count === 'number' && count > 0) return count
  } catch (e) {
    // fallback
  }

  const all = (await getAllSubscribers(true)) as SubscriberItem[]
  return all.filter(s => s.isActive).length
}

/**
 * Fetch filtered subscribers for campaign send.
 */
export async function getSubscribersForSend(targetAudience: string, sourceTag?: string): Promise<SubscriberItem[]> {
  const all = (await getAllSubscribers(true)) as SubscriberItem[]
  const active = all.filter(s => s.isActive)

  if (targetAudience === 'tag' && sourceTag) {
    const cleanTag = sourceTag.trim().toLowerCase()
    return active.filter(s => {
      if (!s.source) return false
      const tags = s.source.split(',').map(t => t.trim().toLowerCase())
      return tags.includes(cleanTag) || s.source.toLowerCase().includes(cleanTag)
    })
  }

  if (targetAudience === 'b2b') {
    return active.filter(s => s.audienceType === 'b2b' || !s.audienceType)
  }

  if (targetAudience === 'b2c') {
    return active.filter(s => s.audienceType === 'b2c')
  }

  if (targetAudience === 'new') {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return active.filter(s => new Date(s.subscribedAt || s._createdAt || 0).getTime() >= thirtyDaysAgo)
  }

  return active
}

/**
 * Save or batch import subscribers.
 * Updates existing records (preserves source tags via comma separation) or appends to chunk.
 */
export async function saveOrUpdateSubscribers(
  newSubscribers: Array<{
    email: string
    name?: string
    company?: string
    audienceType?: 'b2b' | 'b2c' | 'lead'
    source?: string
    phone?: string
    city?: string
    designation?: string
    accreditations?: string
    priority?: string
  }>,
  dualSyncLeads: boolean = false
): Promise<{ added: number; updated: number; totalCount: number }> {
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    count: number
    subscribers: SubscriberItem[]
  }>>(`*[_type == "newsletterSubscriberChunk"] | order(chunkIndex asc) { _id, chunkIndex, count, subscribers }`)

  const chunkList = (chunks || []).map(c => ({
    ...c,
    subscribers: Array.isArray(c.subscribers) ? [...c.subscribers] : []
  }))

  // Map email -> { chunkIndex, subscriberIndex, sub }
  const emailMap = new Map<string, { chunkIdx: number; subIdx: number; item: SubscriberItem }>()
  chunkList.forEach((chunk, cIdx) => {
    chunk.subscribers.forEach((sub, sIdx) => {
      if (sub.email) {
        emailMap.set(sub.email.toLowerCase().trim(), { chunkIdx: cIdx, subIdx: sIdx, item: sub })
      }
    })
  })

  const dirtyChunkIndices = new Set<number>()
  let added = 0
  let updated = 0
  const leadsToSync: Partial<MarketingLeadItem>[] = []

  for (const item of newSubscribers) {
    const cleanEmail = (item.email || '').toLowerCase().trim()
    if (!cleanEmail.includes('@')) continue

    const existing = emailMap.get(cleanEmail)
    if (existing) {
      // Update existing subscriber
      const current = existing.item
      if (item.name) current.name = item.name
      if (item.company) current.company = item.company
      if (item.audienceType) current.audienceType = item.audienceType
      current.isActive = true // Reactivate if re-subscribing

      // Smart Tag Appending: preserve origin while appending new event tag
      if (item.source) {
        const currentSource = current.source || ''
        const existingTags = currentSource.split(',').map(t => t.trim().toLowerCase())
        const newTag = item.source.trim()
        if (!existingTags.includes(newTag.toLowerCase())) {
          current.source = currentSource ? `${currentSource}, ${newTag}` : newTag
        }
      }

      dirtyChunkIndices.add(existing.chunkIdx)
      updated++
    } else {
      // Create new subscriber record
      const id = `newsletterSubscriber-${crypto.createHash('md5').update(cleanEmail).digest('hex').slice(0, 16)}`
      const newSub: SubscriberItem = {
        id,
        email: cleanEmail,
        name: item.name,
        company: item.company,
        audienceType: item.audienceType || 'b2b',
        source: item.source || 'website',
        isActive: true,
        subscribedAt: new Date().toISOString(),
        _createdAt: new Date().toISOString()
      }

      // Find chunk with space or allocate new one
      let targetChunkIdx = chunkList.findIndex(c => c.subscribers.length < CHUNK_MAX_SIZE)
      if (targetChunkIdx === -1) {
        const nextIndex = chunkList.length
        const pad = String(nextIndex).padStart(3, '0')
        const newChunkDoc = {
          _id: `newsletterSubscriberChunk-${pad}`,
          chunkIndex: nextIndex,
          count: 0,
          subscribers: []
        }
        chunkList.push(newChunkDoc)
        targetChunkIdx = nextIndex
      }

      chunkList[targetChunkIdx].subscribers.push(newSub)
      emailMap.set(cleanEmail, {
        chunkIdx: targetChunkIdx,
        subIdx: chunkList[targetChunkIdx].subscribers.length - 1,
        item: newSub
      })
      dirtyChunkIndices.add(targetChunkIdx)
      added++
    }

    if (dualSyncLeads) {
      leadsToSync.push({
        email: cleanEmail,
        name: item.name || '',
        company: item.company || '',
        phone: item.phone || '',
        city: item.city || '',
        designation: item.designation || '',
        accreditations: item.accreditations || '',
        priority: item.priority || 'normal',
        leadType: item.audienceType === 'b2c' ? 'individual' : 'agent',
        source: item.source || 'subscriber_sync'
      })
    }
  }

  // Commit all dirty chunks
  for (const cIdx of dirtyChunkIndices) {
    const chunk = chunkList[cIdx]
    await writeClient.createOrReplace({
      _id: chunk._id,
      _type: 'newsletterSubscriberChunk',
      chunkIndex: chunk.chunkIndex,
      count: chunk.subscribers.length,
      subscribers: chunk.subscribers
    })
  }

  // Dual sync leads if requested
  if (dualSyncLeads && leadsToSync.length > 0) {
    await saveOrUpdateLeads(leadsToSync)
  }

  const totalCount = chunkList.reduce((acc, c) => acc + c.subscribers.length, 0)
  return { added, updated, totalCount }
}

/**
 * Toggle active status of a subscriber.
 */
export async function toggleSubscriberStatus(id: string, isActive: boolean): Promise<boolean> {
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    subscribers: SubscriberItem[]
  }>>(`*[_type == "newsletterSubscriberChunk" && count(subscribers[id == $id]) > 0] { _id, chunkIndex, subscribers }`, { id })

  if (!chunks || chunks.length === 0) return false

  const chunk = chunks[0]
  const target = chunk.subscribers.find(s => s.id === id)
  if (!target) return false

  target.isActive = isActive
  await writeClient.patch(chunk._id).set({ subscribers: chunk.subscribers }).commit()
  return true
}

/**
 * Delete a subscriber from chunk.
 */
export async function deleteSubscriber(id: string): Promise<boolean> {
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    subscribers: SubscriberItem[]
  }>>(`*[_type == "newsletterSubscriberChunk" && count(subscribers[id == $id]) > 0] { _id, chunkIndex, subscribers }`, { id })

  if (!chunks || chunks.length === 0) return false

  const chunk = chunks[0]
  const filtered = chunk.subscribers.filter(s => s.id !== id)
  await writeClient.patch(chunk._id).set({
    count: filtered.length,
    subscribers: filtered
  }).commit()
  return true
}

/**
 * Unsubscribe contact by email.
 */
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  const clean = email.toLowerCase().trim()
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    subscribers: SubscriberItem[]
  }>>(`*[_type == "newsletterSubscriberChunk" && count(subscribers[lower(email) == $clean]) > 0] { _id, chunkIndex, subscribers }`, { clean })

  if (!chunks || chunks.length === 0) return false

  const chunk = chunks[0]
  const target = chunk.subscribers.find(s => (s.email || '').toLowerCase().trim() === clean)
  if (!target) return false

  target.isActive = false
  await writeClient.patch(chunk._id).set({ subscribers: chunk.subscribers }).commit()
  return true
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. MARKETING LEADS STORE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch and filter marketing leads across all chunks.
 */
export async function fetchChunkedLeads(params: {
  limit?: number
  priority?: string
  status?: string
  search?: string
  filterType?: string
}): Promise<{ leads: MarketingLeadItem[]; stats: any }> {
  let allLeads: MarketingLeadItem[] = []

  try {
    const chunks = await writeClient.fetch<Array<{ leads: MarketingLeadItem[] }>>(
      `*[_type == "marketingLeadChunk"] | order(chunkIndex asc) { leads }`
    )

    if (chunks && chunks.length > 0) {
      for (const c of chunks) {
        if (Array.isArray(c.leads)) {
          allLeads.push(...c.leads)
        }
      }
    }
  } catch (e) {
    console.error('Error fetching lead chunks from Sanity, using local store:', e)
  }

  // Fallback to local prepared lead chunks
  if (allLeads.length === 0) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'prepared_lead_chunks.json')
      if (fs.existsSync(filePath)) {
        const leadChunks = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        for (const c of leadChunks) {
          if (Array.isArray(c.leads)) {
            allLeads.push(...c.leads)
          }
        }
      }
    } catch (err) {
      console.error('Fallback lead read error:', err)
    }
  }

  // Quick stats across all leads
  const stats = {
    total: allLeads.length,
    highPriority: allLeads.filter(l => l.priority === 'high').length,
    withWhatsApp: allLeads.filter(l => !!l.whatsapp && l.whatsapp !== '').length,
    contacted: allLeads.filter(l => l.status === 'contacted').length,
    inDiscussion: allLeads.filter(l => l.status === 'in_discussion').length,
    missingPhone: allLeads.filter(l => !l.phone || l.phone === '').length,
    missingEmail: allLeads.filter(l => !l.email || l.email === '').length,
    complete: allLeads.filter(l => !!l.phone && l.phone !== '' && !!l.email && l.email !== '').length
  }

  let filtered = allLeads

  if (params.priority && params.priority !== 'all') {
    filtered = filtered.filter(l => l.priority === params.priority)
  }

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter(l => l.status === params.status)
  }

  if (params.filterType === 'missing_phone') {
    filtered = filtered.filter(l => !l.phone || l.phone === '')
  } else if (params.filterType === 'missing_email') {
    filtered = filtered.filter(l => !l.email || l.email === '')
  } else if (params.filterType === 'complete') {
    filtered = filtered.filter(l => !!l.phone && l.phone !== '' && !!l.email && l.email !== '')
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase()
    filtered = filtered.filter(l =>
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.designation && l.designation.toLowerCase().includes(q)) ||
      (l.source && l.source.toLowerCase().includes(q)) ||
      (l.relevantKeywords && l.relevantKeywords.toLowerCase().includes(q))
    )
  }

  const limit = params.limit ? Math.min(params.limit, 5000) : 1000
  return {
    leads: filtered.slice(0, limit),
    stats
  }
}

/**
 * Save or batch import marketing leads into chunks.
 */
export async function saveOrUpdateLeads(leads: Partial<MarketingLeadItem>[]): Promise<{ added: number; updated: number; totalCount: number }> {
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    count: number
    leads: MarketingLeadItem[]
  }>>(`*[_type == "marketingLeadChunk"] | order(chunkIndex asc) { _id, chunkIndex, count, leads }`)

  const chunkList = (chunks || []).map(c => ({
    ...c,
    leads: Array.isArray(c.leads) ? [...c.leads] : []
  }))

  // Map seed (email or phone) -> { chunkIdx, leadIdx, item }
  const leadMap = new Map<string, { chunkIdx: number; leadIdx: number; item: MarketingLeadItem }>()
  chunkList.forEach((chunk, cIdx) => {
    chunk.leads.forEach((l, lIdx) => {
      if (l.email) leadMap.set(l.email.toLowerCase().trim(), { chunkIdx: cIdx, leadIdx: lIdx, item: l })
      if (l.phone) leadMap.set(l.phone.replace(/[^\d]/g, ''), { chunkIdx: cIdx, leadIdx: lIdx, item: l })
      if (l.id) leadMap.set(l.id, { chunkIdx: cIdx, leadIdx: lIdx, item: l })
    })
  })

  const dirtyChunkIndices = new Set<number>()
  let added = 0
  let updated = 0

  for (const item of leads) {
    const cleanEmail = (item.email || '').toLowerCase().trim()
    const cleanPhone = (item.phone || '').replace(/[^\d]/g, '')
    const idKey = item.id || ''

    const existing = (idKey && leadMap.get(idKey)) ||
                     (cleanEmail && leadMap.get(cleanEmail)) ||
                     (cleanPhone && leadMap.get(cleanPhone))

    if (existing) {
      const current = existing.item
      if (item.name) current.name = item.name
      if (item.email) current.email = cleanEmail
      if (item.phone) current.phone = item.phone
      if (item.whatsapp) current.whatsapp = item.whatsapp
      if (item.company) current.company = item.company
      if (item.city) current.city = item.city
      if (item.designation) current.designation = item.designation
      if (item.accreditations) current.accreditations = item.accreditations
      if (item.priority) current.priority = item.priority
      if (item.leadType) current.leadType = item.leadType
      if (item.status) current.status = item.status
      if (item.source) current.source = item.source
      if (item.relevantKeywords) current.relevantKeywords = item.relevantKeywords
      if (item.notes) current.notes = item.notes
      current._updatedAt = new Date().toISOString()

      dirtyChunkIndices.add(existing.chunkIdx)
      updated++
    } else {
      const seed = cleanEmail || cleanPhone || Math.random().toString()
      const newId = `marketingLead-${crypto.createHash('md5').update(seed).digest('hex').slice(0, 16)}`
      const newLead: MarketingLeadItem = {
        id: newId,
        name: item.name || '',
        email: cleanEmail,
        phone: item.phone || '',
        whatsapp: item.whatsapp || (item.phone ? `https://wa.me/${item.phone.replace(/[^\d]/g, '')}` : ''),
        company: item.company || '',
        city: item.city || '',
        designation: item.designation || '',
        accreditations: item.accreditations || '',
        priority: item.priority || 'normal',
        leadType: item.leadType || 'agent',
        status: item.status || 'new',
        source: item.source || 'manual',
        relevantKeywords: item.relevantKeywords || '',
        notes: item.notes || '',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      }

      let targetChunkIdx = chunkList.findIndex(c => c.leads.length < CHUNK_MAX_SIZE)
      if (targetChunkIdx === -1) {
        const nextIndex = chunkList.length
        const pad = String(nextIndex).padStart(3, '0')
        const newChunkDoc = {
          _id: `marketingLeadChunk-${pad}`,
          chunkIndex: nextIndex,
          count: 0,
          leads: []
        }
        chunkList.push(newChunkDoc)
        targetChunkIdx = nextIndex
      }

      chunkList[targetChunkIdx].leads.push(newLead)
      dirtyChunkIndices.add(targetChunkIdx)
      added++
    }
  }

  for (const cIdx of dirtyChunkIndices) {
    const chunk = chunkList[cIdx]
    await writeClient.createOrReplace({
      _id: chunk._id,
      _type: 'marketingLeadChunk',
      chunkIndex: chunk.chunkIndex,
      count: chunk.leads.length,
      leads: chunk.leads
    })
  }

  const totalCount = chunkList.reduce((acc, c) => acc + c.leads.length, 0)
  return { added, updated, totalCount }
}

/**
 * Update lead status in chunk.
 */
export async function updateLeadStatus(id: string, status: string): Promise<boolean> {
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    leads: MarketingLeadItem[]
  }>>(`*[_type == "marketingLeadChunk" && count(leads[id == $id]) > 0] { _id, chunkIndex, leads }`, { id })

  if (!chunks || chunks.length === 0) return false

  const chunk = chunks[0]
  const target = chunk.leads.find(l => l.id === id)
  if (!target) return false

  target.status = status
  target._updatedAt = new Date().toISOString()
  await writeClient.patch(chunk._id).set({ leads: chunk.leads }).commit()
  return true
}

/**
 * Delete a single lead from chunk.
 */
export async function deleteLead(id: string): Promise<boolean> {
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    leads: MarketingLeadItem[]
  }>>(`*[_type == "marketingLeadChunk" && count(leads[id == $id]) > 0] { _id, chunkIndex, leads }`, { id })

  if (!chunks || chunks.length === 0) return false

  const chunk = chunks[0]
  const filtered = chunk.leads.filter(l => l.id !== id)
  await writeClient.patch(chunk._id).set({
    count: filtered.length,
    leads: filtered
  }).commit()
  return true
}

/**
 * Delete bulk leads from chunks.
 */
export async function deleteBulkLeads(ids: string[]): Promise<number> {
  const idSet = new Set(ids)
  const chunks = await writeClient.fetch<Array<{
    _id: string
    chunkIndex: number
    count: number
    leads: MarketingLeadItem[]
  }>>(`*[_type == "marketingLeadChunk"] { _id, chunkIndex, count, leads }`)

  let deletedCount = 0
  for (const chunk of chunks || []) {
    const initialLen = chunk.leads.length
    const remaining = chunk.leads.filter(l => !idSet.has(l.id))
    if (remaining.length !== initialLen) {
      deletedCount += (initialLen - remaining.length)
      await writeClient.patch(chunk._id).set({
        count: remaining.length,
        leads: remaining
      }).commit()
    }
  }

  return deletedCount
}
