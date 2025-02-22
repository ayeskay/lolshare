// api/upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const file = req.body.file;
  if (!file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  // Replace these with your private repository details
  const repoOwner = 'ayeskay'; // Your GitHub username
  const repoName = 'lolshare-data'; // Your private repository name
  const branch = 'main'; // Branch in the private repository

  // Access the PAT from Vercel environment variables
  const token = process.env.GITHUB_PAT;

  // Get the filename from the request headers
  const filename = req.headers['file-name'];

  // Convert the file to base64
  const content = Buffer.from(file, 'base64');

  // GitHub API URL for uploading files
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
        content: content.toString('base64'),
        branch: branch,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      res.status(200).json({ download_url: data.content.download_url });
    } else {
      res.status(response.status).json({ message: data.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
