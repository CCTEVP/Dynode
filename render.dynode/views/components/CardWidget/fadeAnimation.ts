const FADE_DEFAULTS = {
  speed: "0.5s",
  transition: "ease",
};
window.widgetAnimations = window.widgetAnimations || {};
window.widgetAnimations.CardWidget = window.widgetAnimations.CardWidget || {};

window.widgetAnimations.CardWidget.Fade = function (
  cardWidget,
  dataValue,
  options
) {
  const speed =
    options?.speed ||
    cardWidget.getAttribute("data-animation-speed") ||
    FADE_DEFAULTS.speed;
  const transition =
    options?.transition ||
    cardWidget.getAttribute("data-animation-transition") ||
    FADE_DEFAULTS.transition;
  cardWidget.classList.add("card-fade");
  cardWidget.style.transition = `opacity ${speed} ${transition}`;
  cardWidget.style.opacity = "0";
  setTimeout(() => {
    cardWidget.textContent = dataValue;
    cardWidget.style.opacity = "1";
  }, parseFloat(speed) * 500);
};
