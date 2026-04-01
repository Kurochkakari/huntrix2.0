# PowerShell script to fix logo navigation in product pages

# Get all target files (1.html in 1/, 2/, 3/ subdirectories)
$girlsFiles = Get-ChildItem -Path "альбомы общие женских групп" -Recurse -Filter "1.html" | Where-Object { $_.DirectoryName -like '*\1' -or $_.DirectoryName -like '*\2' -or $_.DirectoryName -like '*\3' }
$boysFiles = Get-ChildItem -Path "альбомы общие мужских групп" -Recurse -Filter "1.html" | Where-Object { $_.DirectoryName -like '*\1' -or $_.DirectoryName -like '*\2' -or $_.DirectoryName -like '*\3' }
$allFiles = $girlsFiles + $boysFiles

Write-Host "Found $($allFiles.Count) files to process"
$count = 0

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file has logo link to replace
    if ($content -match '<a href="\.\./1\.html">') {
        # Change 1: Replace logo link
        $content = $content -replace '<a href="\.\./1\.html">', '<a href="#" onclick="window.location.href = ''../1.html''; return false;">'
        
        # Write the modified content back
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Processed: $($file.Name)"
    }
}

Write-Host "`nCompleted! Modified $count files."
