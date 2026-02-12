# Resize screenshots to 1280x800 for Chrome Web Store
# Place your screenshots in C:\dev\Nakung\screenshots folder
# Resized images will be saved to C:\dev\Nakung\screenshots-resized

Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\dev\Nakung\screenshots"
$outputPath = "C:\dev\Nakung\screenshots-resized"

# Create output folder
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
}

# Target dimensions
$targetWidth = 1280
$targetHeight = 800

Write-Host "Starting screenshot resize..." -ForegroundColor Cyan
Write-Host "Source: $sourcePath" -ForegroundColor Yellow
Write-Host "Output: $outputPath" -ForegroundColor Yellow
Write-Host "Target size: ${targetWidth}x${targetHeight}px" -ForegroundColor Yellow
Write-Host ""

# Process all PNG and JPG files
$imageFiles = Get-ChildItem -Path $sourcePath -File | Where-Object { $_.Extension -match '\.(png|jpg|jpeg)$' }

if ($imageFiles.Count -eq 0) {
    Write-Host "ERROR: No images found in $sourcePath" -ForegroundColor Red
    Write-Host "Please place your screenshots in the 'screenshots' folder first." -ForegroundColor Yellow
    exit
}

foreach ($file in $imageFiles) {
    try {
        Write-Host "Processing: $($file.Name)..." -NoNewline
        
        # Load original image
        $originalImage = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Create new bitmap with exact dimensions
        $resizedImage = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
        
        # Create graphics object for high-quality resize
        $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw resized image
        $graphics.DrawImage($originalImage, 0, 0, $targetWidth, $targetHeight)
        
        # Save as PNG
        $outputFile = Join-Path $outputPath ($file.BaseName + ".png")
        $resizedImage.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Clean up
        $graphics.Dispose()
        $resizedImage.Dispose()
        $originalImage.Dispose()
        
        # Verify size
        $verifyImage = [System.Drawing.Image]::FromFile($outputFile)
        $actualWidth = $verifyImage.Width
        $actualHeight = $verifyImage.Height
        $verifyImage.Dispose()
        
        Write-Host " DONE [${actualWidth}x${actualHeight}px]" -ForegroundColor Green
        
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Resize complete!" -ForegroundColor Green
Write-Host "Resized images saved to: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the 'screenshots-resized' folder" -ForegroundColor White
Write-Host "2. Upload all PNG files to Chrome Web Store" -ForegroundColor White
