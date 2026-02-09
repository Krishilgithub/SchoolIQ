try {
    npm run build 2>&gt; build_err.txt
} catch {
    # Continue
}

$content = Get-Content build_err.txt -Raw
Write-Output $content
