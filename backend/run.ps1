Set-Location $PSScriptRoot

# Show frontend URL in a clean window
Start-Process powershell -ArgumentList @(
"-NoExit",
"-Command",
"Write-Host ''; Write-Host 'Frontend URL:' -ForegroundColor Green; Write-Host 'http://localhost:5173/' -ForegroundColor Cyan"
)

python -m venv venv
.\venv\Scripts\Activate.ps1

Get-Content requirements.txt |
Where-Object { $_ -notmatch '^uvloop' } |
Set-Content requirements_no_uvloop.txt

pip install -r requirements_no_uvloop.txt
Remove-Item requirements_no_uvloop.txt -ErrorAction SilentlyContinue

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload