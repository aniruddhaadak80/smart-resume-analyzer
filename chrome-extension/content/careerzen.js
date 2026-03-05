console.log("[careerzen] Content script loaded on careerzen app.");

// Function to try and inject the data into the Next.js form
function injectJobData(jobData) {
    console.log("[careerzen] Found pending job data. Attempting to inject into form...");

    // We need to keep trying for a few seconds because Next.js components might be hydrating/loading
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds total (500ms * 20)

    const tryInject = setInterval(() => {
        attempts++;

        // In our app, the job description is a textarea with placeholder "Paste the job description here..."
        // or we can target by looking for specific elements.
        const textareas = document.querySelectorAll('textarea');
        let jdTextarea = null;

        // Find the textarea that looks like it's for Job Description
        textareas.forEach(ta => {
            if (ta.placeholder.toLowerCase().includes('job description') || ta.id.toLowerCase().includes('job')) {
                jdTextarea = ta;
            }
        });

        // If not found by specific clues, maybe it's the second textarea, or just try them all
        if (!jdTextarea && textareas.length > 0) {
            jdTextarea = textareas[textareas.length - 1]; // Usually the last one on optimize page
        }

        if (jdTextarea) {
            console.log("[careerzen] Found textarea, injecting job description!");

            // Format the text nicely
            const formattedText = `TARGET ROLE: ${jobData.title}\nURL: ${jobData.url}\n\nDESCRIPTION:\n${jobData.description}`;

            // Important for React/Next.js to detect the change!
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            nativeInputValueSetter.call(jdTextarea, formattedText);

            // Dispatch a trusted event so React's synthetic event system catches it
            const event = new Event('input', { bubbles: true });
            jdTextarea.dispatchEvent(event);

            clearInterval(tryInject);

            // Clear the storage so we don't accidentally do this again if they refresh
            chrome.storage.local.remove(['careerzenPendingJob']);

            // Optionally, we could find the "Optimize" button and click it automatically, 
            // but it's better UX to let the user review the pasted JD first.
        } else if (attempts >= maxAttempts) {
            console.log("[careerzen] Gave up trying to find the auto-fill textarea.");
            clearInterval(tryInject);
        }
    }, 500);
}

// Check if we have a job pending in storage from the extension
chrome.storage.local.get(['careerzenPendingJob'], (result) => {
    if (result.careerzenPendingJob) {
        injectJobData(result.careerzenPendingJob);
    }
});
