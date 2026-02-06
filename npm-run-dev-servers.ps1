# Launch each project in its own Windows Terminal tab
$projects = @(
	@{ Title = "source.dynode"; Path = "E:\Development\Web\NODE\dynode\source.dynode"; Timeout=15000 },
	@{ Title = "builder.dynode"; Path = "E:\Development\Web\NODE\dynode\builder.dynode"; Timeout=500 },
	@{ Title = "render.dynode"; Path = "E:\Development\Web\NODE\dynode\render.dynode"; Timeout=500 },
	@{ Title = "echo.dynode"; Path = "E:\Development\Web\NODE\dynode\echo.dynode"; Timeout=500 }
)

foreach ($project in $projects) {
	$arguments = @(
		"-w", "0",
		"new-tab",
		"--title", $project.Title,
		"-d", $project.Path,
		"pwsh.exe",
		"-NoExit",
		"-Command",
		"npm run dev"
	)

	Start-Process wt.exe -ArgumentList $arguments
	Start-Sleep -Milliseconds $project.Timeout
}