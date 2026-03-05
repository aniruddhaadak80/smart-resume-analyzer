# 🤝 Contributing to careerzen

First of all, thank you for showing interest in contributing to careerzen! 🎉 We want this project to be welcoming, accessible, and easy for **anyone** to contribute to—whether you're an experienced developer or making your very first open-source contribution!

![Welcome Contributors](/public/assets/contributor_welcome.png)

This guide will walk you through the entire process, step-by-step.

---

## 🤔 How Can I Contribute?

You don't just have to write code to contribute! You can:
- **Report Bugs**: If something is broken, please open an Issue.
- **Suggest Features**: Have a cool idea? Open an Issue and let's discuss it!
- **Improve Documentation**: Fixing typos or adding clearer explanations here in the docs is always appreciated.
- **Write Code**: Look through our issues marked with `good first issue` or `help wanted` to find something to work on.

---

## 🛠️ Step-by-Step Guide for Code Contributions

Follow these simple steps to get your code into careerzen.

### Step 1: Fork and Clone the Repository

To make changes, you first need your own copy of the code on your computer.

![Fork and Clone](/public/assets/github_fork_clone.png)

1. Click the **Fork** button at the top right of this repository's page to create a copy on your GitHub account.
2. Open your terminal and **Clone** your fork to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-resume-analyzer.git
   cd smart-resume-analyzer
   ```

### Step 2: Set Up the Project

Let's install everything you need to run the app.

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the main folder and add the necessary API keys (you'll need a Google Gemini API Key).
3. Set up the local database:
   ```bash
   npx prisma generate
   ```

### Step 3: Create a Branch

Never work directly on the `main` branch. Create a new branch for your specific feature or fix.
```bash
git checkout -b your-descriptive-branch-name
```
*(Example: `git checkout -b fix-header-typo`)*

### Step 4: Make Your Changes

Now for the fun part! Write your code, fix the bug, or update the docs.
- Test your changes by running `npm run dev` and checking `localhost:3000`.
- Make sure your code is clean and you haven't broken any existing features.

### Step 5: Commit and Push

Save your changes and send them up to your GitHub account.

1. Add your files:
   ```bash
   git add .
   ```
2. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: adding dark mode to navbar"
   ```
3. Push to your branch:
   ```bash
   git push origin your-descriptive-branch-name
   ```

### Step 6: Open a Pull Request! 🎁

You're almost done! Now you just hand your code over to us to review.

![Merge PR](/public/assets/pr_merge.png)

1. Go to the original `smart-resume-analyzer` repository on GitHub.
2. You should see a green button that says **"Compare & pull request"**. Click it!
3. Fill out the Pull Request template, explaining what you changed and why.
4. Submit it! A maintainer will review your code and give you friendly feedback.

---

## 🧭 Finding an Issue to Work On

Not sure where to start? Go to the **Issues** tab and look for labels:
- 🟢 `good first issue`: Perfect if you are new to the project or open source.
- 🟡 `help wanted`: We definitely need assistance with these!
- 🟣 `enhancement`: New features or improvements.

---

## 🎉 You're Done!
Thank you again for contributing. We can't wait to see what you build! Let's make careerzen awesome together. 🚀
