const { execSync } = require('child_process');

async function createAndMergePR(branchName, title, body = '') {
  try {
    const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n' }).toString();
    const token = creds.match(/password=(.+)/)[1].trim();

    const repo = 'Alex-2006-alt/Code-visualizer';
    console.log(`[PR] Creating PR for ${branchName} -> main...`);

    const res = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CodeTrace-Automation',
      },
      body: JSON.stringify({
        title,
        head: branchName,
        base: 'main',
        body: body || title,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[PR Error]`, data.message, data.errors || '');
      return null;
    }

    console.log(`[PR Created] #${data.number}: ${data.html_url}`);

    // Automatically merge the PR to count both PR and merge contribution!
    console.log(`[PR Merge] Merging #${data.number}...`);
    const mergeRes = await fetch(`https://api.github.com/repos/${repo}/pulls/${data.number}/merge`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CodeTrace-Automation',
      },
      body: JSON.stringify({
        commit_title: `${title} (#${data.number})`,
        merge_method: 'merge',
      }),
    });

    const mergeData = await mergeRes.json();
    if (mergeRes.ok) {
      console.log(`[PR Merged] #${data.number} successfully merged into main!`);
    } else {
      console.error(`[Merge Error]`, mergeData.message);
    }

    return data;
  } catch (err) {
    console.error(`[Error]`, err.message);
    return null;
  }
}

const [branch, title, body] = process.argv.slice(2);
if (branch && title) {
  createAndMergePR(branch, title, body);
}

module.exports = { createAndMergePR };
