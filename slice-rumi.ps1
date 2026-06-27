# Slice the Rumi sprite sheet (2 rows x 3 cols) into individual pose PNGs.
# Usage:  powershell -ExecutionPolicy Bypass -File slice-rumi.ps1
# Expects: assets/rumi-sprites.png  ->  outputs rumi-sit/stand/run/lie/wave/sleep.png + avatar.png
param(
  [string]$Src = "$PSScriptRoot\assets\rumi-sprites.png",
  [string]$Out = "$PSScriptRoot\assets"
)
Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Src)) { Write-Error "Sprite sheet not found: $Src"; exit 1 }

$img  = [System.Drawing.Bitmap]::FromFile($Src)
$cols = 3; $rows = 2
$cw = [int]($img.Width  / $cols)
$ch = [int]($img.Height / $rows)
$names = @( @('rumi-sit','rumi-stand','rumi-run'), @('rumi-lie','rumi-wave','rumi-sleep') )

function Trim-Bitmap($bmp) {
  $minX = $bmp.Width; $minY = $bmp.Height; $maxX = 0; $maxY = 0; $found = $false
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      if ($bmp.GetPixel($x, $y).A -gt 12) {
        $found = $true
        if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if (-not $found) { return $bmp }
  $pad = 6
  $minX = [Math]::Max(0, $minX - $pad); $minY = [Math]::Max(0, $minY - $pad)
  $maxX = [Math]::Min($bmp.Width - 1,  $maxX + $pad); $maxY = [Math]::Min($bmp.Height - 1, $maxY + $pad)
  $rect = New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
  return $bmp.Clone($rect, $bmp.PixelFormat)
}

for ($r = 0; $r -lt $rows; $r++) {
  for ($c = 0; $c -lt $cols; $c++) {
    $rect = New-Object System.Drawing.Rectangle(($c * $cw), ($r * $ch), $cw, $ch)
    $cell = $img.Clone($rect, $img.PixelFormat)
    $trim = Trim-Bitmap $cell
    $path = Join-Path $Out ($names[$r][$c] + '.png')
    $trim.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host ("saved {0}  ({1}x{2})" -f $path, $trim.Width, $trim.Height)
    if ($trim -ne $cell) { $trim.Dispose() }
    $cell.Dispose()
  }
}
Copy-Item (Join-Path $Out 'rumi-sit.png') (Join-Path $Out 'avatar.png') -Force
$img.Dispose()
Write-Host "done - 6 poses + avatar.png written to $Out"
