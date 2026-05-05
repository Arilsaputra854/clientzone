import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Parse GitHub URL
    // Format: https://github.com/owner/repo
    const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) {
      return NextResponse.json({ error: "Hanya mendukung repository GitHub saat ini" }, { status: 400 });
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    // 1. Fetch Repo Info (Visibility & Existence)
    const repoRes = await fetch(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (repoRes.status === 404) {
      return NextResponse.json({ error: "Repository tidak ditemukan atau bersifat Private" }, { status: 404 });
    }

    const repoData = await repoRes.json();
    if (repoData.private) {
      return NextResponse.json({ error: "Repository bersifat Private. Mohon gunakan repository Public." }, { status: 400 });
    }

    // 2. Fetch Branches
    const branchesRes = await fetch(`${apiUrl}/branches`);
    const branchesData = await branchesRes.json();
    const branches = Array.isArray(branchesData) ? branchesData.map((b: any) => b.name) : [];

    // 3. Detect Project Type (Check for specific files)
    const contentsRes = await fetch(`${apiUrl}/contents`);
    const contents = await contentsRes.json();
    
    let projectType = "Unknown";
    let isHostable = false;

    if (Array.isArray(contents)) {
      const fileNames = contents.map((f: any) => f.name);
      
      if (fileNames.includes("package.json")) {
        // Try to check package.json content for framework
        const pkgRes = await fetch(`${apiUrl}/contents/package.json`);
        const pkgData = await pkgRes.json();
        const pkgContent = JSON.parse(Buffer.from(pkgData.content, 'base64').toString());
        
        if (pkgContent.dependencies?.next) projectType = "Next.js";
        else if (pkgContent.devDependencies?.vite || pkgContent.dependencies?.vite) projectType = "Vite / React";
        else if (pkgContent.dependencies?.nuxt) projectType = "Nuxt.js";
        else projectType = "Node.js App";
        
        isHostable = true;
      } else if (fileNames.includes("index.html")) {
        projectType = "Static HTML";
        isHostable = true;
      } else if (fileNames.includes("docker-compose.yml") || fileNames.includes("Dockerfile")) {
        projectType = "Dockerized App";
        isHostable = true;
      }
    }

    return NextResponse.json({
      owner,
      repo,
      branches,
      projectType,
      isHostable,
      description: repoData.description,
      stars: repoData.stargazers_count
    });

  } catch (error: any) {
    console.error("Repo Check Error:", error);
    return NextResponse.json({ error: "Gagal memproses data repository" }, { status: 500 });
  }
}
