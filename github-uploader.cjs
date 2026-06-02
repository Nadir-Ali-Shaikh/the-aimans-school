const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper to make HTTPS requests using standard library
function githubRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ statusCode: res.statusCode, message: parsed.message || 'API Error', details: parsed });
          }
        } catch (e) {
          reject({ statusCode: res.statusCode, message: 'JSON Parse Error', data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// Recursively find all files to upload
function getFilesToUpload(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  const ignoreDirs = ['node_modules', '.venv', '.git', '__pycache__', 'dist', '.tanstack'];
  const ignoreFiles = ['github-uploader.js', 'github-uploader.cjs', 'package-lock.json', 'bun.lock']; // skip heavy/unnecessary files

  for (const file of list) {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
    const stats = fs.lstatSync(filePath);

    if (stats.isDirectory()) {
      if (ignoreDirs.includes(file)) continue;
      results = results.concat(getFilesToUpload(filePath, baseDir));
    } else {
      if (ignoreFiles.includes(file)) continue;
      results.push({
        absolutePath: filePath,
        relativePath: relativePath
      });
    }
  }
  return results;
}

async function start() {
  console.log('====================================================');
  console.log('   🚀 Premium GitHub Direct Uploader (No Git Needed)  ');
  console.log('====================================================\n');

  console.log('This script will upload your project directly to a new GitHub repository.');
  console.log('You need a GitHub Personal Access Token (PAT) with "repo" permission.');
  console.log('Generate one here: https://github.com/settings/tokens\n');

  let token = process.argv[2];
  let username = process.argv[3];
  let repoName = process.argv[4];

  if (!token || !username || !repoName) {
    token = (await ask('🔑 Enter your GitHub Personal Access Token (PAT): ')).trim();
    username = (await ask('👤 Enter your GitHub Username: ')).trim();
    repoName = (await ask('📦 Enter new Repository Name (e.g. Loveable-Aimns): ')).trim();
  }

  if (!token || !username || !repoName) {
    console.error('❌ Error: All fields are required.');
    rl.close();
    return;
  }

  // 1. Create Repository
  console.log(`\nCreating new repository "${repoName}" on GitHub...`);
  const createOptions = {
    hostname: 'api.github.com',
    path: '/user/repos',
    method: 'POST',
    headers: {
      'User-Agent': 'NodeJS-GitHub-Uploader',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const createData = {
    name: repoName,
    description: 'Auto-uploaded by Antigravity AI Code Assistant',
    private: false
  };

  try {
    await githubRequest(createOptions, createData);
    console.log(`✅ Repository "https://github.com/${username}/${repoName}" created successfully!`);
  } catch (err) {
    if (err.statusCode === 422) {
      console.log(`ℹ️ Repository "${repoName}" already exists on your GitHub. We will upload to it.`);
    } else {
      console.log(`⚠️ Warning: Could not create repository automatically (${err.message || err}). We will try to upload to it anyway in case it was created manually.`);
    }
  }

  // 2. Scan Files
  console.log('\nScanning files in project...');
  const files = getFilesToUpload(process.cwd());
  console.log(`Found ${files.length} files to upload.`);

  // 3. Upload Files Sequentially
  console.log('\nUploading files... Please wait...');
  
  let successCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = fs.readFileSync(file.absolutePath);
    const contentBase64 = content.toString('base64');

    const uploadOptions = {
      hostname: 'api.github.com',
      path: `/repos/${username}/${repoName}/contents/${encodeURIComponent(file.relativePath)}`,
      method: 'PUT',
      headers: {
        'User-Agent': 'NodeJS-GitHub-Uploader',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const uploadData = {
      message: `Upload ${file.relativePath} via Antigravity Uploader`,
      content: contentBase64
    };

    const percent = Math.round(((i + 1) / files.length) * 100);
    process.stdout.write(`⏳ [${percent}%] Uploading: ${file.relativePath}... `);

    try {
      await githubRequest(uploadOptions, uploadData);
      process.stdout.write('✅ Done\n');
      successCount++;
    } catch (err) {
      // If file already exists, we might need a SHA to update it. Let's try to get SHA and update.
      if (err.statusCode === 409 || err.statusCode === 422) {
        try {
          // Get the current file metadata to extract SHA
          const getOptions = {
            hostname: 'api.github.com',
            path: `/repos/${username}/${repoName}/contents/${encodeURIComponent(file.relativePath)}`,
            method: 'GET',
            headers: {
              'User-Agent': 'NodeJS-GitHub-Uploader',
              'Authorization': `token ${token}`
            }
          };
          const fileMeta = await githubRequest(getOptions);
          uploadData.sha = fileMeta.sha; // Include SHA to overwrite

          await githubRequest(uploadOptions, uploadData);
          process.stdout.write('🔄 Updated ✅\n');
          successCount++;
        } catch (updateErr) {
          process.stdout.write(`❌ Failed (${updateErr.message})\n`);
        }
      } else {
        process.stdout.write(`❌ Failed (${err.message})\n`);
      }
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 Cleanup & Upload Complete!`);
  console.log(`Successfully uploaded ${successCount}/${files.length} files.`);
  console.log(`Check your repository here: https://github.com/${username}/${repoName}`);
  console.log('====================================================\n');

  rl.close();
}

start().catch(console.error);
