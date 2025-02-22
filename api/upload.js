export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const file = req.body; // Get the binary file directly
  if (!file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  const repoOwner = 'ayeskay'; // Replace with your GitHub username
  const repoName = 'lolshare-data'; //Replace with your private repository name
  const branch = 'main'; // Replace with your branch name
  const token = process.env.GITHUB_PAT; // Access the PAT from environment variables

  const filename = req.headers['file-name']; // Get the filename from headers

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload ${filename}`,
        content: Buffer.from(file).toString('base64'), // Convert binary to base64
        branch: branch,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      res.status(200).json({ download_url: data.content.download_url });
    } else {
      res.status(response.status).json({ message: data.message || 'GitHub API error' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
