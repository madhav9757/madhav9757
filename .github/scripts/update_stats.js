const fs = require('fs');
const path = require('path');

// Auto-load .env file from root or parent directories if present
function loadEnv() {
    if (typeof process.loadEnvFile === 'function') {
        try {
            process.loadEnvFile();
            return;
        } catch (_) {}
    }
    const candidatePaths = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../../.env'),
        path.resolve(__dirname, '../.env'),
        path.resolve(__dirname, '.env')
    ];
    for (const envPath of candidatePaths) {
        if (fs.existsSync(envPath)) {
            const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
            break;
        }
    }
}
loadEnv();

let GITHUB_TOKEN = process.env.GH_TOKEN || process.env.PAT || process.env.GITHUB_TOKEN;
if (GITHUB_TOKEN) GITHUB_TOKEN = GITHUB_TOKEN.trim();
const USERNAME = process.env.GH_USERNAME || process.env.GITHUB_USERNAME || 'madhav9757';

async function fetchAllTimeContributions(username, token) {
    const url = 'https://api.github.com/graphql';

    // 1. Get user creation date
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'GitHub-Stats-Script'
        },
        body: JSON.stringify({
            query: `query($login: String!) { user(login: $login) { createdAt } }`,
            variables: { login: username }
        })
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP error! status: ${res.status} (${res.statusText}) - ${body}`);
    }
    const data = await res.json();
    if (!data.data || !data.data.user) {
        throw new Error('Failed to fetch user creation date: ' + JSON.stringify(data.errors || data));
    }
    const createdAt = new Date(data.data.user.createdAt);
    const startYear = createdAt.getFullYear();
    const currentYear = new Date().getFullYear();

    // 2. Build query for all years to calculate public + private (restricted) contributions
    let queryParts = '';
    for (let year = startYear; year <= currentYear; year++) {
        const from = `${year}-01-01T00:00:00Z`;
        const to = `${year}-12-31T23:59:59Z`;
        queryParts += `
        year${year}: contributionsCollection(from: "${from}", to: "${to}") {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalIssueContributions
            restrictedContributionsCount
        }
        `;
    }

    const fullQuery = `
    query($login: String!) {
        user(login: $login) {
            ${queryParts}
        }
    }
    `;

    const commitsRes = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'GitHub-Stats-Script'
        },
        body: JSON.stringify({
            query: fullQuery,
            variables: { login: username }
        })
    });
    const commitsData = await commitsRes.json();
    if (!commitsData.data || !commitsData.data.user) {
        throw new Error('Failed to fetch yearly contributions: ' + JSON.stringify(commitsData.errors || commitsData));
    }

    let totalCommits = 0;
    let totalReviews = 0;
    let totalContributions = 0;
    const collections = commitsData.data.user;
    for (let year = startYear; year <= currentYear; year++) {
        const yearData = collections[`year${year}`];
        if (yearData) {
            const commits = yearData.totalCommitContributions || 0;
            const reviews = yearData.totalPullRequestReviewContributions || 0;
            const prs = yearData.totalPullRequestContributions || 0;
            const issues = yearData.totalIssueContributions || 0;
            const restricted = yearData.restrictedContributionsCount || 0;

            // Pure commits count (accurate)
            totalCommits += commits;
            totalReviews += reviews;
            // Total contributions combining commits, PRs, reviews, issues, and private activity
            totalContributions += (commits + reviews + prs + issues + restricted);
        }
    }
    return {
        commits: totalCommits,
        reviews: totalReviews,
        totalContributions: totalContributions
    };
}

async function fetchSearchCount(query, token) {
    try {
        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`;
        const headers = {
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'GitHub-Stats-Script'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (res.ok) {
            const data = await res.json();
            if (typeof data.total_count === 'number') {
                return data.total_count;
            }
        }
    } catch (e) {
        console.warn(`Failed to fetch count for query "${query}":`, e.message);
    }
    return 0;
}

async function fetchStats() {
    const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER) {
          nodes {
            stargazerCount
            forkCount
          }
        }
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
        pullRequests(first: 1, states: [MERGED, CLOSED, OPEN]) {
          totalCount
        }
        mergedPullRequests: pullRequests(first: 1, states: MERGED) {
          totalCount
        }
        issues(first: 1) {
          totalCount
        }
        repositoriesContributedTo(first: 1) {
          totalCount
        }
      }
    }
    `;

    const url = 'https://api.github.com/graphql';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'GitHub-Stats-Script'
            },
            body: JSON.stringify({ query, variables: { login: USERNAME } })
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`HTTP error! status: ${res.status} (${res.statusText}) - ${body}`);
        }

        const resData = await res.json();
        if (resData.errors) {
            console.error("GraphQL errors:", resData.errors);
            return null;
        }

        const user = resData.data.user;

        const stars = user.repositories.nodes.reduce((acc, repo) => acc + repo.stargazerCount, 0);
        const forks = user.repositories.nodes.reduce((acc, repo) => acc + repo.forkCount, 0);

        // Fetch all time commits (public + private) and reviews
        const allTime = await fetchAllTimeContributions(USERNAME, GITHUB_TOKEN);

        // Fetch all-time total PRs, merged PRs, and issues across all accessible repos (GraphQL + Search API)
        const [searchPrs, searchMergedPrs, searchIssues] = await Promise.all([
            fetchSearchCount(`author:${USERNAME} type:pr`, GITHUB_TOKEN),
            fetchSearchCount(`author:${USERNAME} type:pr is:merged`, GITHUB_TOKEN),
            fetchSearchCount(`author:${USERNAME} type:issue`, GITHUB_TOKEN)
        ]);

        const totalPrs = Math.max(user.pullRequests?.totalCount || 0, searchPrs || 0);
        const totalMergedPrs = Math.max(user.mergedPullRequests?.totalCount || 0, searchMergedPrs || 0);
        const totalIssues = Math.max(user.issues?.totalCount || 0, searchIssues || 0);
        const mergeRate = totalPrs > 0
            ? ((totalMergedPrs / totalPrs) * 100).toFixed(1) + '%'
            : '0%';

        // Calculate max streak from contributionCalendar
        const cal = user.contributionsCollection?.contributionCalendar;
        let longestStreak = 0;
        let tempStreak = 0;
        if (cal?.weeks) {
            const days = [];
            for (const w of cal.weeks) {
                for (const d of w.contributionDays) {
                    days.push({ date: d.date, count: d.contributionCount });
                }
            }
            days.sort((a, b) => a.date.localeCompare(b.date));
            for (const d of days) {
                if (d.count > 0) {
                    tempStreak++;
                    if (tempStreak > longestStreak) longestStreak = tempStreak;
                } else {
                    tempStreak = 0;
                }
            }
        }
        const streakStr = longestStreak > 0 ? `${longestStreak} DAYS` : '0 DAYS';

        // Calculate Dev Rank
        const rawMerge = totalPrs > 0 ? (totalMergedPrs / totalPrs) * 100 : 0;
        let devRank = 'A-TIER';
        if (rawMerge >= 85 && (allTime.totalContributions >= 1000 || allTime.commits >= 1000)) {
            devRank = 'S-TIER';
        } else if (rawMerge >= 75) {
            devRank = 'A+';
        }

        return {
            stars: stars.toString(),
            forks: forks.toString(),
            commits: allTime.commits >= 1000 ? (allTime.commits / 1000).toFixed(1) + 'K' : allTime.commits.toString(),
            contribs: allTime.totalContributions >= 1000 ? (allTime.totalContributions / 1000).toFixed(1) + 'K' : allTime.totalContributions.toString(),
            prs: totalPrs.toString(),
            prs_merged: mergeRate,
            issues: totalIssues.toString(),
            issues_closed: totalIssues.toString(),
            repos_contributed: user.repositoriesContributedTo.totalCount.toString(),
            reviews: allTime.reviews.toString(),
            streak: streakStr,
            dev_rank: devRank
        };
    } catch (e) {
        console.error(`Error fetching stats: ${e.message || e}`);
        return null;
    }
}

function renderSvgContent(stats, theme = 'dark') {
    const isDark = theme === 'dark';

    const c = isDark ? {
        bg: '#0D1117',
        border: '#30363D',
        shadow: '#000000',
        cardBg: '#161B22',
        cardBorder: '#30363D',
        cardShadow: '#000000',
        label: '#8B949E',
        value: '#FFFFFF',
        metrics: {
            stars:    { bg: '#2D2305', border: '#FFE600', icon: '#FFE600' },
            contribs: { bg: '#3B1E08', border: '#FB923C', icon: '#FB923C' },
            forks:    { bg: '#1E2530', border: '#8B949E', icon: '#E2E8F0' },
            commits:  { bg: '#0C2B42', border: '#38BDF8', icon: '#38BDF8' },
            prs:      { bg: '#0B331A', border: '#4ADE80', icon: '#4ADE80' },
            merged:   { bg: '#291542', border: '#C084FC', icon: '#C084FC' },
            issues:   { bg: '#380E23', border: '#F472B6', icon: '#F472B6' },
            repos:    { bg: '#092D33', border: '#2DD4BF', icon: '#2DD4BF' },
            reviews:  { bg: '#0A3022', border: '#34D399', icon: '#34D399' },
            streak:   { bg: '#3B0D18', border: '#FB7185', icon: '#FB7185' },
            rank:     { bg: '#3D2600', border: '#F59E0B', icon: '#F59E0B' }
        }
    } : {
        bg: '#FFFFFF',
        border: '#000000',
        shadow: '#000000',
        cardBg: '#FFFFFF',
        cardBorder: '#000000',
        cardShadow: '#000000',
        label: '#000000',
        value: '#000000',
        metrics: {
            stars:    { bg: '#FFE600', border: '#000000', icon: '#000000' },
            contribs: { bg: '#FB923C', border: '#000000', icon: '#000000' },
            forks:    { bg: '#E2E8F0', border: '#000000', icon: '#000000' },
            commits:  { bg: '#7DD3FC', border: '#000000', icon: '#000000' },
            prs:      { bg: '#86EFAC', border: '#000000', icon: '#000000' },
            merged:   { bg: '#D8B4FE', border: '#000000', icon: '#000000' },
            issues:   { bg: '#F472B6', border: '#000000', icon: '#000000' },
            repos:    { bg: '#67E8F9', border: '#000000', icon: '#000000' },
            reviews:  { bg: '#6EE7B7', border: '#000000', icon: '#000000' },
            streak:   { bg: '#FB7185', border: '#000000', icon: '#000000' },
            rank:     { bg: '#F59E0B', border: '#000000', icon: '#000000' }
        }
    };

    function card(x, y, m, iconPath, label, val) {
        return `
    <g transform="translate(${x}, ${y})">
      <!-- Brutalist Hard Shadow -->
      <rect x="3" y="3" width="207" height="35" fill="${c.cardShadow}" />
      <!-- Main Card -->
      <rect x="0" y="0" width="207" height="35" fill="${c.cardBg}" stroke="${c.cardBorder}" stroke-width="1.5" />
      <!-- Sharp Icon Box -->
      <rect x="0" y="0" width="35" height="35" fill="${m.bg}" stroke="${isDark ? m.border : c.cardBorder}" stroke-width="1.5" />
      <svg x="9.5" y="9.5" width="16" height="16" viewBox="0 0 16 16" fill="${m.icon}">
        ${iconPath}
      </svg>
      <!-- Label -->
      <text class="label" x="45" y="18" dominant-baseline="central">${label}</text>
      <!-- Value -->
      <text class="value" x="197" y="18" text-anchor="end" dominant-baseline="central">${val}</text>
    </g>`;
    }

    const starIcon = '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>';
    const contribIcon = '<path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5H2.5Zm10.75-2a.25.25 0 0 0-.25-.25H2.75a.25.25 0 0 0-.25.25V6h10.75V5.5Z"/>';
    const forkIcon = '<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>';
    const commitIcon = '<path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>';
    const prIcon = '<path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm2.25-.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 8.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.82-1.7l1.45-1.45a.75.75 0 0 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0l-2.75-2.75a.75.75 0 0 1 1.06-1.06l1.45 1.45V5.372a2.25 2.25 0 1 1 1.5 0v3.678Z"/>';
    const mergedIcon = '<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>';
    const issueIcon = '<path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>';
    const repoIcon = '<path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>';
    const reviewIcon = '<path d="M1.5 1.75a.75.75 0 0 0-1.5 0v12.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 0-1.5H1.5V1.75Zm14.28 2.53a.75.75 0 0 0-1.06-1.06L10 7.94 7.28 5.22a.75.75 0 0 0-1.06 0L3.22 8.22a.75.75 0 0 0 1.06 1.06L7 6.56l2.72 2.72a.75.75 0 0 0 1.06 0l5-5Z"/>';
    const streakIcon = '<path d="M8.22 1.034a.75.75 0 0 0-.44 0C5.1 1.77 3 4.25 3 7.5a5 5 0 0 0 10 0c0-3.25-2.1-5.73-4.78-6.466ZM8 14A3.5 3.5 0 0 1 4.5 7.5c0-2.3 1.4-4.14 3.5-4.88 2.1.74 3.5 2.58 3.5 4.88A3.5 3.5 0 0 1 8 14Z"/>';
    const rankIcon = '<path d="M4 1.75C4 .784 4.784 0 5.75 0h4.5C11.216 0 12 .784 12 1.75V2h1.5A2.5 2.5 0 0 1 16 4.5v1A4.5 4.5 0 0 1 11.5 10h-.07a5.502 5.502 0 0 1-4.86 3.93A2 2 0 0 0 8 15a2 2 0 0 0 1.43-1.07A5.502 5.502 0 0 1 4.57 10H4.5A4.5 4.5 0 0 1 0 5.5v-1A2.5 2.5 0 0 1 2.5 2H4v-.25ZM2.5 3.5c-.552 0-1 .448-1 1v1c0 1.657 1.343 3 3 3h.5V3.5h-2.5Zm11 4.5c1.657 0 3-1.343 3-3v-1c0-.552-.448-1-1-1H13v6.5h.5Z"/>';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="275" viewBox="0 0 480 275">
  <defs>
    <style>
      .label { fill: ${c.label}; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
      .value { fill: ${c.value}; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; font-size: 15px; font-weight: 800; }
    </style>
  </defs>

  <!-- Outer Brutalist Hard Shadow -->
  <rect x="6" y="6" width="470" height="265" fill="${c.shadow}" />

  <!-- Outer Container Card -->
  <rect x="2" y="2" width="470" height="265" fill="${c.bg}" stroke="${c.border}" stroke-width="${isDark ? '2' : '2.5'}" />

  <!-- Row 1 -->
  ${card(17, 16, c.metrics.stars, starIcon, 'STARS', stats.stars)}
  ${card(247, 16, c.metrics.contribs, contribIcon, 'TOTAL CONTRIBS', stats.contribs)}

  <!-- Row 2 -->
  ${card(17, 66, c.metrics.commits, commitIcon, 'COMMITS', stats.commits)}
  ${card(247, 66, c.metrics.prs, prIcon, 'PULL REQUESTS', stats.prs)}

  <!-- Row 3 -->
  ${card(17, 116, c.metrics.merged, mergedIcon, 'MERGE RATE', stats.prs_merged)}
  ${card(247, 116, c.metrics.issues, issueIcon, 'ISSUES', stats.issues || stats.issues_closed)}

  <!-- Row 4 -->
  ${card(17, 166, c.metrics.repos, repoIcon, 'REPOS CONTRIB', stats.repos_contributed)}
  ${card(247, 166, c.metrics.reviews, reviewIcon, 'CODE REVIEWS', stats.reviews)}

  <!-- Row 5 -->
  ${card(17, 216, c.metrics.streak, streakIcon, 'MAX STREAK', stats.streak)}
  ${card(247, 216, c.metrics.rank, rankIcon, 'DEV RANK', stats.dev_rank)}

</svg>`;
}

function updateSvg(stats) {
    const assetsDir = fs.existsSync(path.resolve(process.cwd(), 'assets')) 
        ? path.resolve(process.cwd(), 'assets')
        : path.resolve(__dirname, '../../assets');

    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const darkSvg = renderSvgContent(stats, 'dark');
    const lightSvg = renderSvgContent(stats, 'light');

    fs.writeFileSync(path.join(assetsDir, 'stats-card-dark.svg'), darkSvg, 'utf-8');
    fs.writeFileSync(path.join(assetsDir, 'stats-card-light.svg'), lightSvg, 'utf-8');
    fs.writeFileSync(path.join(assetsDir, 'stats-card.svg'), darkSvg, 'utf-8');
}

async function main() {
    if (!GITHUB_TOKEN) {
        console.error("GITHUB_TOKEN not found! Please set GITHUB_TOKEN in your .env file or environment variables.");
        process.exit(1);
    }

    console.log(`Fetching stats for ${USERNAME}...`);
    const stats = await fetchStats();
    if (stats) {
        updateSvg(stats);
        console.log("Successfully updated dark, light, and default stats cards in assets/ with stats:", stats);
    } else {
        console.error("Failed to fetch stats");
        process.exit(1);
    }
}

main();
