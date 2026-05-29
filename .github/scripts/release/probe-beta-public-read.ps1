param(
  [string]$MetadataUrl = ""
)

$ErrorActionPreference = "Stop"

function Resolve-MetadataUrl {
  if (-not [string]::IsNullOrWhiteSpace($MetadataUrl)) {
    return $MetadataUrl
  }
  if (-not [string]::IsNullOrWhiteSpace($env:PUBLISHED_METADATA_URL)) {
    return $env:PUBLISHED_METADATA_URL
  }
  throw "published metadata URL is required"
}

function Get-RequiredWebResponse([string]$Url) {
  if ([string]::IsNullOrWhiteSpace($Url)) {
    throw "missing required public URL"
  }
  return Invoke-WebRequest -UseBasicParsing -Uri $Url -Method Get
}

function Assert-PublicRangeReadable([string]$Url) {
  if ([string]::IsNullOrWhiteSpace($Url)) {
    throw "missing installer URL for public-read probe"
  }
  & curl.exe --ssl-no-revoke --fail --silent --show-error --location --range 0-0 --output NUL $Url
  if ($LASTEXITCODE -ne 0) {
    throw "public artifact probe failed for $Url"
  }
}

$resolvedMetadataUrl = Resolve-MetadataUrl
$metadataResponse = Get-RequiredWebResponse $resolvedMetadataUrl
$metadata = $metadataResponse.Content | ConvertFrom-Json
$win = $metadata.platforms.win
if ($null -eq $win) {
  throw "published metadata is missing platforms.win"
}

$smallUrls = @(
  [string]$resolvedMetadataUrl,
  [string]$metadata.r2.versionMetadataUrl,
  [string]$win.feed.latestUrl,
  [string]$win.r2.latestManifestUrl,
  [string]$win.r2.versionManifestUrl,
  [string]$win.artifacts.installer.sha256Url
) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique

foreach ($url in $smallUrls) {
  $response = Get-RequiredWebResponse $url
  Write-Host "public ok: $url ($($response.StatusCode))"
}

Assert-PublicRangeReadable ([string]$win.artifacts.installer.url)
Write-Host "public ok: $($win.artifacts.installer.url) (range GET)"
