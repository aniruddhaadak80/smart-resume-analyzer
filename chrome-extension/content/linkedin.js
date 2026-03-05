console.log("[careerzen] Content script loaded on LinkedIn Jobs.");

const careerzenColor = "#2563EB"; // Blue
const careerzenHoverColor = "#1D4ED8"; // Darker Blue

function injectAnalyzeButton() {
    // LinkedIn changes its DOM frequently. We look for the main Actions container.
    // The top job snapshot container usually has a class like .job-view-layout-jobs-details 
    // or we can target the apply button area.

    // Attempt 1: The container right next to the "Easy Apply" / "Save" buttons
    const applyButtonContainers = document.querySelectorAll('.jobs-apply-button--top-card, .jobs-save-button');
    if (applyButtonContainers.length === 0) return; // Not fully loaded yet

    const container = applyButtonContainers[0].parentElement;

    // Check if we already injected our button
    if (document.getElementById('careerzen-analyze-btn')) return;

    // Create the button
    const btn = document.createElement('button');
    btn.id = 'careerzen-analyze-btn';
    btn.innerHTML = `<svg style="width:16px;height:16px;margin-right:6px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Score with careerzen`;

    // Basic inline styles (we also have a CSS file if needed)
    btn.style.backgroundColor = careerzenColor;
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "8px 16px";
    btn.style.borderRadius = "24px";
    btn.style.fontWeight = "600";
    btn.style.fontSize = "14px";
    btn.style.cursor = "pointer";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.marginLeft = "8px";
    btn.style.transition = "background-color 0.2s";

    btn.addEventListener('mouseover', () => btn.style.backgroundColor = careerzenHoverColor);
    btn.addEventListener('mouseout', () => btn.style.backgroundColor = careerzenColor);

    btn.addEventListener('click', handleAnalyzeClick);

    // Insert next to the apply button
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.appendChild(btn);
}

function handleAnalyzeClick(e) {
    e.preventDefault();
    const btn = document.getElementById('careerzen-analyze-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Analyzing...";
    btn.style.opacity = "0.7";

    // Grab the job description
    const descriptionElement = document.getElementById('job-details');
    // For some LinkedIn layouts, it might be an article with class jobs-description__content
    const fallbackDescElement = document.querySelector('.jobs-description__content');

    const titleElement = document.querySelector('.job-details-jobs-unified-top-card__job-title, .t-24');
    const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name');

    const jobTitle = titleElement ? titleElement.innerText.trim() : "Unknown Target Job";
    const companyName = companyElement ? companyElement.innerText.trim() : "";
    const fullJobTitle = `${jobTitle} ${companyName ? 'at ' + companyName : ''}`.trim();

    let descriptionText = "";
    if (descriptionElement) {
        descriptionText = descriptionElement.innerText;
    } else if (fallbackDescElement) {
        descriptionText = fallbackDescElement.innerText;
    }

    if (!descriptionText) {
        alert("careerzen couldn't find the job description on this page. Make sure the job details are fully loaded.");
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        return;
    }

    const jobData = {
        title: fullJobTitle,
        description: descriptionText.trim(),
        url: window.location.href
    };

    console.log("[careerzen] Captured job data, sending to background...");

    // Send to background script
    chrome.runtime.sendMessage({ action: "analyze_job", data: jobData }, (response) => {
        btn.innerHTML = "Opening careerzen 🚀";
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.opacity = "1";
        }, 3000);
    });
}

// LinkedIn is an SPA, so we need a MutationObserver to detect when job pages load
const observer = new MutationObserver(() => {
    if (window.location.href.includes('/jobs/')) {
        injectAnalyzeButton();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial check
if (window.location.href.includes('/jobs/')) {
    setTimeout(injectAnalyzeButton, 1000);
}
