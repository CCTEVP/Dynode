/// <reference types="../../../types/global" />

function initializeVideoWidgets() {
  console.log("Initializing VideoWidgets");
  const videoWidgets = document.querySelectorAll('[id^="video-widget-"]');
  videoWidgets.forEach((videoWidget) => {});
}

if (window.widgetInitializer) {
  window.widgetInitializer.register("VideoWidgets", initializeVideoWidgets);
}
