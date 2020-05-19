if (Test-Path -Path README.md) {
  Remove-Item -Path README.md
}
Copy-Item -Path use-shopping-cart\README.md -Destination README.md
git add README.md
