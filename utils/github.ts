async function fetchGithubRepoInfo(repo: string) {
    try {
        const response = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export { fetchGithubRepoInfo };