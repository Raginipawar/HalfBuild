// Import from GitHub: reads a user's PUBLIC repositories from the GitHub REST API.
// No login and no token, so nothing private is ever touched. GitHub allows
// about 60 of these requests per hour per visitor, which is plenty for importing.

const pretty = (name) => name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export async function fetchRepos(username) {
  let res
  try {
    res = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?sort=pushed&per_page=100`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
  } catch {
    return { ok: false, error: 'Could not reach GitHub. Check your connection, or fill the form in by hand.' }
  }
  if (res.status === 404) return { ok: false, error: 'No GitHub user with that name.' }
  if (res.status === 403) return { ok: false, error: 'GitHub is limiting requests right now. Try again in a few minutes, or fill the form in by hand.' }
  if (!res.ok) return { ok: false, error: 'GitHub did not answer as expected. Try again later.' }
  const repos = (await res.json()).filter((r) => !r.fork)
  return { ok: true, repos }
}

// Turn a repository into the fields of our Add project form.
export function repoToForm(r) {
  return {
    name: pretty(r.name),
    description: r.description ?? '',
    tools: [r.language, ...(r.topics ?? [])].filter(Boolean).slice(0, 6),
    repo: r.html_url,
    demo: r.homepage ?? '',
    startedOn: r.created_at.slice(0, 10),
    lastTouchedOn: r.pushed_at.slice(0, 10),
  }
}
