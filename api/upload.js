import { IncomingForm } from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error parsing form' });
    }

    console.log('Files:', files); // Debug: Check the files object

    const file = files.file?.[0]; // Access the first file in the array
    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'No file provided or file path is missing' });
    }

    const repoOwner = 'ayeskay';
    const repoName = 'lolshare-data';
    const branch = 'main';
    const token = process.env.GITHUB_PAT;

    const filename = file.originalFilename;
    const fileContent = fs.readFileSync(file.filepath); // Read the file

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
          content: fileContent.toString('base64'),
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
  });
}