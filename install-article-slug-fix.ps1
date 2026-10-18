param([string]$ProjectRoot = (Get-Location).Path)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($ProjectRoot)
$patch = Join-Path $PSScriptRoot 'article-slug-404-fix-v2.patch'
$index = Join-Path $root 'backend\src\index.js'
$controller = Join-Path $root 'backend\src\api\article\controllers\article.js'
$helper = Join-Path $root 'backend\src\utils\article-slugs.js'
if (-not (Test-Path -LiteralPath $index) -or -not (Test-Path -LiteralPath $controller) -or -not (Test-Path -LiteralPath $patch)) {
  throw 'Run from the zgweb root and keep the patch next to this installer.'
}
$source = [IO.File]::ReadAllText($index, [Text.Encoding]::UTF8)
$anchor = '  async bootstrap({ strapi }) {'
if ($source.Contains('repairMissingArticleSlugs') -and (Test-Path -LiteralPath $helper)) {
  Write-Host 'Article slug fix is already installed.'
  exit 0
}
if (-not $source.Contains('repairMissingArticleSlugs') -and -not $source.Contains($anchor)) { throw 'Could not find Strapi bootstrap hook. No files were changed.' }
& git -C $root apply --check $patch
if ($LASTEXITCODE -ne 0) { throw 'Article controller differs from the patch. No files were changed.' }
$backup = Join-Path $root ('slug-fix-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -Path $backup -ItemType Directory | Out-Null
Copy-Item -LiteralPath $index -Destination (Join-Path $backup 'index.js')
Copy-Item -LiteralPath $controller -Destination (Join-Path $backup 'article.js')
& git -C $root apply $patch
if ($LASTEXITCODE -ne 0) { throw 'git apply failed; original files are in the backup directory.' }
$lineBreak = if ($source.Contains("`r`n")) { "`r`n" } else { "`n" }
$hook = @(
  '    try {'
  "      const repaired = await require('./utils/article-slugs').repairMissingArticleSlugs(strapi);"
  '      if (repaired) strapi.log.info(`Article slug repair: ${repaired} versions updated.`);'
  '    } catch (error) {'
  '      strapi.log.error(`Article slug repair failed: ${error.message}`);'
  '    }'
  ''
) -join $lineBreak
if (-not $source.Contains('repairMissingArticleSlugs')) {
  $updated = $source.Replace($anchor, $anchor + $lineBreak + $hook)
  [IO.File]::WriteAllText($index, $updated, (New-Object Text.UTF8Encoding($false)))
}
Write-Host "Installed. Backup: $backup"
Write-Host 'Restart Strapi and check the article links.'
