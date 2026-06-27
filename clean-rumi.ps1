# Remove the near-white background from each Rumi sprite by edge flood-fill,
# producing real transparency (32bpp PNG). Interior white marks are preserved
# because they are not connected to the border.
Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\cxiay\personal-website\assets"
$files = Get-ChildItem (Join-Path $dir "rumi-*.png") | Where-Object { $_.Name -ne "rumi-sprites.png" }

foreach ($f in $files) {
  $orig = [System.Drawing.Bitmap]::FromFile($f.FullName)
  $w = $orig.Width; $h = $orig.Height
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($orig, 0, 0, $w, $h); $g.Dispose(); $orig.Dispose()

  $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $h)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  $visited = New-Object bool[] ($w * $h)
  $stack = New-Object System.Collections.Generic.Stack[int]
  for ($x = 0; $x -lt $w; $x++) { foreach ($y in @(0, ($h - 1))) { $p = $y * $w + $x; if (-not $visited[$p]) { $visited[$p] = $true; $stack.Push($p) } } }
  for ($y = 0; $y -lt $h; $y++) { foreach ($x in @(0, ($w - 1))) { $p = $y * $w + $x; if (-not $visited[$p]) { $visited[$p] = $true; $stack.Push($p) } } }

  $removed = 0
  while ($stack.Count -gt 0) {
    $p = $stack.Pop(); $y = [int]($p / $w); $x = $p - $y * $w
    $o = $y * $stride + $x * 4
    $b = $bytes[$o]; $gr = $bytes[$o + 1]; $r = $bytes[$o + 2]
    $mx = [Math]::Max($r, [Math]::Max($gr, $b)); $mn = [Math]::Min($r, [Math]::Min($gr, $b))
    if ($mn -gt 196 -and ($mx - $mn) -lt 26) {
      $bytes[$o + 3] = 0; $removed++
      if ($x + 1 -lt $w) { $np = $p + 1;  if (-not $visited[$np]) { $visited[$np] = $true; $stack.Push($np) } }
      if ($x - 1 -ge 0)  { $np = $p - 1;  if (-not $visited[$np]) { $visited[$np] = $true; $stack.Push($np) } }
      if ($y + 1 -lt $h) { $np = $p + $w; if (-not $visited[$np]) { $visited[$np] = $true; $stack.Push($np) } }
      if ($y - 1 -ge 0)  { $np = $p - $w; if (-not $visited[$np]) { $visited[$np] = $true; $stack.Push($np) } }
    }
  }
  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  $bmp.UnlockBits($data)
  $bmp.Save($f.FullName, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("cleaned {0}  (removed {1} bg px)" -f $f.Name, $removed)
}
Copy-Item (Join-Path $dir 'rumi-sit.png') (Join-Path $dir 'avatar.png') -Force
Write-Host "done"
