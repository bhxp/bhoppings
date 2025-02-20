function getPreloadedValue(name) {
  const preloadElement = document.querySelector(`preload[name="${name}"]`);
  if (preloadElement) {
    return preloadElement.textContent;
  } else {
    console.error(
      "Error getting preloaded value: Preload element not found:",
      name,
    );
    return null;
  }
}
(function () {
  const style = document.createElement("style");
  style.textContent = `preload{display:none !important;}`;
  document.head.appendChild(style);
})();
