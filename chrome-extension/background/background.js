// Listens for messages from the LinkedIn content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyze_job") {
        const jobData = request.data;

        // Save the job data to local storage so the new tab can access it
        chrome.storage.local.set({ careerzenPendingJob: jobData }, () => {
            // Determine the URL to open (use localhost for dev, careerzen.vercel.app for prod)
            // For now, let's default to localhost if not specified, or hardcode Vercel depending on environment.
            // Let's use the local dev environment as primary for testing, but users can configure it.
            const targetUrl = "http://localhost:3000/optimize";

            // Open the new tab
            chrome.tabs.create({ url: targetUrl }, (tab) => {
                console.log("Opened careerzen tab:", tab.id);
            });
        });

        sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
});
