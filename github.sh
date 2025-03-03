#!/bin/bash

# Navigate to your Replit workspace folder
cd ~/workspace || exit

# Ensure the repository is initialized in the workspace root
if [ ! -d ".git" ]; then
  echo "Error: Repository not found in the workspace root."
  exit 1
fi

# Ensure the remote repository is set correctly
remote_url=$(git remote get-url origin 2>/dev/null)
if [ -z "$remote_url" ]; then
  echo "Remote 'origin' not found. Setting remote URL..."
  git remote add origin https://ChezLinkZ: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@github.com/bhxp/bhoppings.git

fi

# Function to push changes
push_changes() {
  # Check for any uncommitted changes
  if [[ $(git status --porcelain) ]]; then
    # Stage all changes (add all modified files)
    git add .

    # Prompt for commit message
    read -p "Enter commit message: " commit_message

    # Commit the changes
    git commit -m "$commit_message"

    # Push the changes to the 'main' branch
    git push origin main
    echo "Changes pushed to the main branch."
  else
    echo "No changes to commit."
  fi
}

# Confirm pushing changes
read -p "Are you sure you want to push your changes? (y/n): " confirm_push
if [[ $confirm_push == "y" || $confirm_push == "Y" ]]; then
  push_changes
else
  echo "Push operation canceled."
fi