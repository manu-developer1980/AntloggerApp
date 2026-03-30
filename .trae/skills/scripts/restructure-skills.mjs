import { promises as fs } from 'fs';
import path from 'path';

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // Skip node_modules or hidden/system dirs if present
      if (e.name === 'node_modules' || e.name.startsWith('.git')) continue;
      files = await walk(full, files);
    } else if (e.isFile()) {
      if (full.endsWith('.md')) files.push(full);
    }
  }
  return files;
}

function toPosixRelative(from, to) {
  let rel = path.relative(from, to);
  // Normalize Windows backslashes to POSIX slashes
  rel = rel.split(path.sep).join('/');
  if (!rel.startsWith('./') && !rel.startsWith('../')) rel = './' + rel;
  return rel;
}

async function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const report = {
    rootDir,
    processed: [],
    skipped: [],
    updatedLinks: [],
    brokenLinks: [],
    errors: [],
  };

  const allMd = await walk(rootDir);
  // Identify skill files: exclude root README.md and any already named SKILL.md
  const skillFiles = allMd.filter((p) => {
    const base = path.basename(p);
    if (base.toLowerCase() === 'readme.md') return false;
    if (base === 'SKILL.md') return false;
    // Only consider files inside category dirs (one level under root)
    const rel = path.relative(rootDir, p).split(path.sep);
    if (rel.length < 2) return false;
    return true;
  });

  for (const file of skillFiles) {
    try {
      const dir = path.dirname(file);
      const name = path.parse(file).name;
      const destDir = path.join(dir, name);
      const destFile = path.join(destDir, 'SKILL.md');
      await fs.mkdir(destDir, { recursive: true });
      await fs.rename(file, destFile);
      report.processed.push({
        original: path.relative(rootDir, file),
        newDir: path.relative(rootDir, destDir),
        newFile: path.relative(rootDir, destFile),
      });
    } catch (err) {
      report.errors.push({ file: path.relative(rootDir, file), error: String(err) });
    }
  }

  // Update README.md links
  const readmePath = path.join(rootDir, 'README.md');
  try {
    let readme = await fs.readFile(readmePath, 'utf8');
    for (const m of report.processed) {
      const originalRel = './' + m.original.split(path.sep).join('/');
      const newRel = './' + m.newFile.split(path.sep).join('/');
      const regex = new RegExp(`\\(${originalRel.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\)`, 'g');
      const before = readme;
      readme = readme.replace(regex, `(${newRel})`);
      if (before !== readme) {
        report.updatedLinks.push({ from: originalRel, to: newRel });
      }
    }
    await fs.writeFile(readmePath, readme, 'utf8');
  } catch (err) {
    report.errors.push({ file: 'README.md', error: String(err) });
  }

  // Verify all README links point to existing files
  try {
    const readme = await fs.readFile(readmePath, 'utf8');
    const linkRegex = /\((\.\/[^\)]+)\)/g;
    const rootPosix = rootDir.split(path.sep).join('/');
    const matches = [...readme.matchAll(linkRegex)];
    for (const match of matches) {
      const rel = match[1];
      if (!rel.endsWith('.md')) continue;
      const abs = path.join(rootDir, rel.replace('./', ''));
      try {
        await fs.access(abs);
      } catch {
        report.brokenLinks.push(rel);
      }
    }
  } catch (err) {
    report.errors.push({ file: 'README.md', error: String(err) });
  }

  const outDir = path.join(rootDir, 'scripts');
  await fs.mkdir(outDir, { recursive: true });
  const reportPath = path.join(outDir, 'restructure-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // Console summary
  console.log(`Root: ${rootDir}`);
  console.log(`Processed: ${report.processed.length}`);
  console.log(`Updated README links: ${report.updatedLinks.length}`);
  if (report.brokenLinks.length) {
    console.log('Broken links found in README:');
    for (const l of report.brokenLinks) console.log(` - ${l}`);
  } else {
    console.log('No broken README links.');
  }
  if (report.errors.length) {
    console.log('Errors:');
    for (const e of report.errors) console.log(` - ${e.file}: ${e.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
