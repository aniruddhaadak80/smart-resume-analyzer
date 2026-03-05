document.getElementById('open-app-btn').addEventListener('click', () => {
    // Open localhost for dev, but can be changed to vercel domain
    chrome.tabs.create({ url: "http://localhost:3000" });
});
