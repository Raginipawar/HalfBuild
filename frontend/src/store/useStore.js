import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { makeSeed } from './seed'

// DEMO AUTHENTICATION ONLY. Passwords are hashed in the browser and kept in
// localStorage. There is no server, so this is not real security.
async function sha256(text) {
  const bytes = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const now = () => new Date().toISOString()

// localStorage can throw (private mode, blocked storage), so wrap it
const safeStorage = {
  getItem: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  setItem: (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k) } catch { /* ignore */ } },
}

export const useStore = create(
  persist(
    (set, get) => {
      // Every project change goes through here: patch it, touch it, log it.
      const changeProject = (id, patch, type, detail = '') => {
        const { projects, currentUserId } = get()
        const p = projects.find((x) => x.id === id)
        if (!p) return
        const next = { ...p, ...(typeof patch === 'function' ? patch(p) : patch), lastTouchedOn: now() }
        set({
          projects: projects.map((x) => (x.id === id ? next : x)),
          events: [{ id: uid('e'), userId: currentUserId ?? p.ownerId, projectId: id, type, date: now(), detail }, ...get().events],
        })
      }

      return {
        ...makeSeed(),

        async signup({ name, username, email, password, skills = [] }) {
          const { users } = get()
          const mail = email.trim().toLowerCase()
          const handle = username.trim().toLowerCase()
          if (users.some((u) => u.email === mail)) return { ok: false, error: 'That email already has a city. Try logging in.' }
          if (users.some((u) => u.username === handle)) return { ok: false, error: 'That username is taken. Pick another one.' }
          const user = { id: uid('u'), name: name.trim(), username: handle, email: mail, passwordHash: await sha256(password), skills, joinedOn: now() }
          set({ users: [...users, user], currentUserId: user.id })
          return { ok: true }
        },

        async login({ email, password }) {
          const user = get().users.find((u) => u.email === email.trim().toLowerCase())
          if (!user) return { ok: false, error: 'We could not find a city for that email.' }
          if (user.passwordHash !== (await sha256(password))) return { ok: false, error: 'That password does not match. Try again.' }
          set({ currentUserId: user.id })
          return { ok: true }
        },

        logout() {
          set({ currentUserId: null })
        },

        addProject(data) {
          const { currentUserId, projects, events } = get()
          const project = {
            id: uid('p'),
            ownerId: currentUserId,
            name: '', description: '', goal: '',
            completedParts: [], pendingParts: [],
            reason: 'time', tools: [], links: { repo: '', demo: '' },
            startedOn: now(), lastTouchedOn: now(),
            status: 'paused', inspection: null, chosenPath: null, lessons: '',
            openForCollab: false, skillsNeeded: [], joinRequests: [], coBuilders: [],
            ...data,
          }
          set({
            projects: [...projects, project],
            events: [{ id: uid('e'), userId: currentUserId, projectId: project.id, type: 'created', date: now(), detail: project.name }, ...events],
          })
          return project.id
        },

        updateProject(id, patch) {
          changeProject(id, patch, 'updated')
        },

        // result comes from logic/revivalScore.js
        runInspection(id, result) {
          changeProject(id, { inspection: { ...result, date: now() }, status: 'inspected' }, 'inspected', `Score ${result.score}`)
        },

        applyPath(id, path, extra = {}) {
          if (path === 'continue' || path === 'restart') {
            changeProject(id, { chosenPath: path, status: 'reviving' }, 'revived', `Path: ${path}`)
          } else if (path === 'changeIdea') {
            changeProject(id, { chosenPath: path, status: 'reviving', goal: extra.goal ?? '' }, 'revived', 'Path: new idea')
          } else if (path === 'repurpose') {
            const { part, targetId } = extra
            changeProject(targetId, (t) => ({ completedParts: [...t.completedParts, part] }), 'floorAdded', `${part} (moved in)`)
            changeProject(id, { chosenPath: path, status: 'landmark' }, 'archived', `Repurposed ${part}`)
          } else if (path === 'archive') {
            changeProject(id, { chosenPath: path, status: 'landmark', lessons: extra.lessons ?? '' }, 'archived', 'Laid to rest as a landmark')
          }
        },

        completePart(id, part) {
          changeProject(id, (p) => ({
            pendingParts: p.pendingParts.filter((x) => x !== part),
            completedParts: [...p.completedParts, part],
          }), 'floorAdded', part)
        },

        markRebuilt(id) {
          changeProject(id, { status: 'rebuilt', pendingParts: [] }, 'rebuilt', 'All floors built')
        },

        archiveProject(id, lessons) {
          changeProject(id, { status: 'landmark', chosenPath: 'archive', lessons }, 'archived', 'Laid to rest as a landmark')
        },

        toggleCollab(id, skillsNeeded) {
          changeProject(id, (p) => ({ openForCollab: !p.openForCollab, skillsNeeded: skillsNeeded ?? p.skillsNeeded }), 'updated', 'Co-builder setting changed')
        },

        requestJoin(id, message) {
          const userId = get().currentUserId
          changeProject(id, (p) => ({
            joinRequests: [...p.joinRequests.filter((r) => r.userId !== userId), { userId, message, status: 'pending', date: now() }],
          }), 'joinRequested', message)
        },

        respondJoin(id, userId, accept) {
          changeProject(id, (p) => ({
            joinRequests: p.joinRequests.map((r) => (r.userId === userId ? { ...r, status: accept ? 'accepted' : 'declined' } : r)),
            coBuilders: accept ? [...new Set([...p.coBuilders, userId])] : p.coBuilders,
          }), 'updated', accept ? 'Co-builder joined' : 'Join request declined')
        },

        resetDemo() {
          set(makeSeed())
        },
      }
    },
    {
      name: 'halfbuilt-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ users, projects, events, currentUserId }) => ({ users, projects, events, currentUserId }),
      // keep the seed if storage is empty or broken, so the demo never looks empty
      merge: (stored, current) => (stored?.users?.length ? { ...current, ...stored } : current),
    },
  ),
)

export const useCurrentUser = () =>
  useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
