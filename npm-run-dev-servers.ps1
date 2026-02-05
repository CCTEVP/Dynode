# Launch each project in its own Windows Terminal tab
$projects = @(
	@{ Title = "source.dynode"; Path = "E:\Development\Web\NODE\dn-dynamic-campaign-tools\source.dynode" },
	@{ Title = "builder.dynode"; Path = "E:\Development\Web\NODE\dn-dynamic-campaign-tools\builder.dynode" },
	@{ Title = "render.dynode"; Path = "E:\Development\Web\NODE\dn-dynamic-campaign-tools\render.dynode" },
	@{ Title = "echo.dynode"; Path = "E:\Development\Web\NODE\dn-dynamic-campaign-tools\echo.dynode" }
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
	Start-Sleep -Milliseconds 500
}