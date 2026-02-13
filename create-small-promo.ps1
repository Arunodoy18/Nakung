# Nakung Small Promo Tile Generator (440x280px)
Add-Type -AssemblyName System.Drawing

$width = 440
$height = 280

# Create bitmap
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Gradient background (purple to blue)
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$startColor = [System.Drawing.Color]::FromArgb(255, 99, 102, 241)  # Purple
$endColor = [System.Drawing.Color]::FromArgb(255, 59, 130, 246)    # Blue
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $startColor, $endColor, 45)
$graphics.FillRectangle($brush, $rect)

# Add subtle pattern overlay
$overlayColor = [System.Drawing.Color]::FromArgb(20, 255, 255, 255)
$overlayBrush = New-Object System.Drawing.SolidBrush($overlayColor)
for ($i = 0; $i -lt 10; $i++) {
    $x = Get-Random -Minimum 0 -Maximum $width
    $y = Get-Random -Minimum 0 -Maximum $height
    $size = Get-Random -Minimum 20 -Maximum 60
    $graphics.FillEllipse($overlayBrush, $x, $y, $size, $size)
}

# White text
$white = [System.Drawing.Color]::White
$whiteTransparent = [System.Drawing.Color]::FromArgb(200, 255, 255, 255)

# Title: "NAKUNG" (large, bold)
$titleFont = New-Object System.Drawing.Font("Segoe UI", 42, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush($white)
$titleText = "NAKUNG"
$titleSize = $graphics.MeasureString($titleText, $titleFont)
$titleX = ($width - $titleSize.Width) / 2
$titleY = 50
$graphics.DrawString($titleText, $titleFont, $titleBrush, $titleX, $titleY)

# Subtitle: "AI Coding Mentor"
$subtitleFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$subtitleBrush = New-Object System.Drawing.SolidBrush($whiteTransparent)
$subtitleText = "AI Coding Mentor"
$subtitleSize = $graphics.MeasureString($subtitleText, $subtitleFont)
$subtitleX = ($width - $subtitleSize.Width) / 2
$subtitleY = 110
$graphics.DrawString($subtitleText, $subtitleFont, $subtitleBrush, $subtitleX, $subtitleY)

# Features
$featuresFont = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)
$featuresBrush = New-Object System.Drawing.SolidBrush($white)
$featuresText = "Partner & Reviewer Modes"
$featuresSize = $graphics.MeasureString($featuresText, $featuresFont)
$featuresX = ($width - $featuresSize.Width) / 2
$featuresY = 160
$graphics.DrawString($featuresText, $featuresFont, $featuresBrush, $featuresX, $featuresY)

# Platforms
$platformsText = "LeetCode | CodeChef | HackerRank"
$platformsSize = $graphics.MeasureString($platformsText, $featuresFont)
$platformsX = ($width - $platformsSize.Width) / 2
$platformsY = 190
$graphics.DrawString($platformsText, $featuresFont, $featuresBrush, $platformsX, $platformsY)

# Save
$outputPath = Join-Path (Get-Location) "nakung-small-440x280.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$graphics.Dispose()
$bmp.Dispose()

Write-Host "Small promo tile created: $outputPath" -ForegroundColor Green
Write-Host "Size: 440x280 pixels" -ForegroundColor Cyan
Invoke-Item $outputPath
