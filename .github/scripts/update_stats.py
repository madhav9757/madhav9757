import os
import json
import urllib.request

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
USERNAME = "madhav9757"

def fetch_stats():
    query = """
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            stargazerCount
            forkCount
          }
        }
        pullRequests(first: 1, states: [MERGED, CLOSED, OPEN]) {
          totalCount
        }
        mergedPullRequests: pullRequests(first: 1, states: MERGED) {
          totalCount
        }
        issues(first: 1, states: CLOSED) {
          totalCount
        }
        repositoriesContributedTo(first: 1) {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
        }
      }
    }
    """
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Content-Type": "application/json"
    }
    data = json.dumps({"query": query, "variables": {"login": USERNAME}}).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=data, headers=headers)
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            user = res_data["data"]["user"]
            
            stars = sum(repo["stargazerCount"] for repo in user["repositories"]["nodes"])
            forks = sum(repo["forkCount"] for repo in user["repositories"]["nodes"])
            commits = user["contributionsCollection"]["totalCommitContributions"]
            
            return {
                "stars": str(stars),
                "forks": str(forks),
                "commits": f"{commits/1000:.1f}K" if commits >= 1000 else str(commits),
                "prs": str(user["pullRequests"]["totalCount"]),
                "prs_merged": str(user["mergedPullRequests"]["totalCount"]),
                "issues_closed": str(user["issues"]["totalCount"]),
                "repos_contributed": str(user["repositoriesContributedTo"]["totalCount"]),
            }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return None

def update_svg(stats):
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240" viewBox="0 0 480 240">
  <defs>
    <style>
      .bg {{ fill: #0d1117; stroke: #30363d; stroke-width: 1px; rx: 10px; }}
      .title {{ fill: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600; }}
      .text {{ fill: #8b949e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; }}
      .val-bg {{ fill: #21262d; rx: 6px; }}
      .val-text {{ fill: #c9d1d9; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace; font-size: 13px; font-weight: 600; text-anchor: end;}}
    </style>
  </defs>

  <rect class="bg" x="0.5" y="0.5" width="479" height="239" />
  
  <text x="240" y="32" class="title" text-anchor="middle">GitHub Activity</text>
  <line x1="0" y1="46" x2="480" y2="46" stroke="#30363d" stroke-width="1" />

  <!-- Row 1 -->
  <g transform="translate(20, 68)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#e3b341"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">Stars</text>
  </g>
  <rect class="val-bg" x="150" y="62" width="60" height="26" />
  <text x="200" y="79" class="val-text">{stats['stars']}</text>

  <g transform="translate(250, 68)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">Forks</text>
  </g>
  <rect class="val-bg" x="390" y="62" width="60" height="26" />
  <text x="440" y="79" class="val-text">{stats['forks']}</text>

  <!-- Row 2 -->
  <g transform="translate(20, 110)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">Commits</text>
  </g>
  <rect class="val-bg" x="150" y="104" width="60" height="26" />
  <text x="200" y="121" class="val-text">{stats['commits']}</text>

  <g transform="translate(250, 110)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#3fb950"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm2.25-.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 8.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.82-1.7l1.45-1.45a.75.75 0 0 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0l-2.75-2.75a.75.75 0 0 1 1.06-1.06l1.45 1.45V5.372a2.25 2.25 0 1 1 1.5 0v3.678Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">Pull Requests</text>
  </g>
  <rect class="val-bg" x="390" y="104" width="60" height="26" />
  <text x="440" y="121" class="val-text">{stats['prs']}</text>

  <!-- Row 3 -->
  <g transform="translate(20, 152)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#a371f7"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">PRs Merged</text>
  </g>
  <rect class="val-bg" x="150" y="146" width="60" height="26" />
  <text x="200" y="163" class="val-text">{stats['prs_merged']}</text>

  <g transform="translate(250, 152)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#a371f7"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">Issues Closed</text>
  </g>
  <rect class="val-bg" x="390" y="146" width="60" height="26" />
  <text x="440" y="163" class="val-text">{stats['issues_closed']}</text>

  <!-- Row 4 -->
  <g transform="translate(20, 194)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path></svg>
    <text x="24" y="13" class="text" font-weight="600">Repos Contributed</text>
  </g>
  <rect class="val-bg" x="390" y="188" width="60" height="26" />
  <text x="440" y="205" class="val-text">{stats['repos_contributed']}</text>

</svg>
"""
    with open("assets/stats-card.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

if __name__ == "__main__":
    if not GITHUB_TOKEN:
        print("GITHUB_TOKEN not found!")
        exit(1)
        
    stats = fetch_stats()
    if stats:
        update_svg(stats)
        print("Successfully updated stats-card.svg")
    else:
        print("Failed to fetch stats")
        exit(1)
