#!/bin/bash

###############################################################################
# BASH QUICK START GUIDE
# Save this file and run: bash QUICKSTART.sh
# Or make it executable: chmod +x QUICKSTART.sh && ./QUICKSTART.sh
###############################################################################

echo "=========================================="
echo "BASH COMMAND QUICK START GUIDE"
echo "=========================================="
echo ""

# Navigation Commands
echo "1. NAVIGATION & DIRECTORY COMMANDS"
echo "-----------------------------------"
echo "pwd                    # Print working directory"
echo "ls                     # List files"
echo "ls -la                 # List all files with details"
echo "cd /path/to/dir        # Change directory"
echo "cd ..                  # Go up one level"
echo "cd ~                   # Go to home directory"
echo ""

# File Operations
echo "2. FILE OPERATIONS"
echo "-----------------------------------"
echo "touch file.txt         # Create empty file"
echo "cat file.txt           # Display file contents"
echo "less file.txt          # View file (press q to quit)"
echo "head file.txt          # Show first 10 lines"
echo "tail file.txt          # Show last 10 lines"
echo "tail -f file.txt       # Follow file changes (logs)"
echo "cp source dest         # Copy file"
echo "mv source dest         # Move/rename file"
echo "rm file.txt            # Remove file"
echo ""

# Directory Operations
echo "3. DIRECTORY OPERATIONS"
echo "-----------------------------------"
echo "mkdir dirname          # Create directory"
echo "mkdir -p path/to/dir   # Create nested directories"
echo "rmdir dirname          # Remove empty directory"
echo "rm -rf dirname         # Remove directory and contents"
echo "cp -r source dest      # Copy directory recursively"
echo ""

# Search and Find
echo "4. SEARCH & FIND"
echo "-----------------------------------"
echo "grep 'pattern' file    # Search for pattern in file"
echo "grep -r 'pattern' .    # Search recursively in directory"
echo "grep -i 'pattern' file # Case-insensitive search"
echo "find . -name '*.txt'   # Find files by name"
echo "find . -type f         # Find all files"
echo "find . -type d         # Find all directories"
echo ""

# Process Management
echo "5. PROCESS MANAGEMENT"
echo "-----------------------------------"
echo "ps aux                 # List all processes"
echo "ps aux | grep name     # Find specific process"
echo "kill PID               # Kill process by ID"
echo "kill -9 PID            # Force kill process"
echo "killall process_name   # Kill all processes by name"
echo "top                    # Monitor processes (press q to quit)"
echo "htop                   # Better process monitor (if installed)"
echo ""

# System Information
echo "6. SYSTEM INFORMATION"
echo "-----------------------------------"
echo "whoami                 # Current username"
echo "hostname               # System hostname"
echo "uname -a               # System information"
echo "df -h                  # Disk space usage"
echo "du -sh directory       # Directory size"
echo "free -h                # Memory usage"
echo "date                   # Current date and time"
echo ""

# File Permissions
echo "7. FILE PERMISSIONS"
echo "-----------------------------------"
echo "chmod +x file.sh       # Make file executable"
echo "chmod 755 file.sh      # Set specific permissions"
echo "chmod -R 755 dir       # Set permissions recursively"
echo "chown user:group file  # Change file owner"
echo ""

# Piping & Redirection
echo "8. PIPING & REDIRECTION"
echo "-----------------------------------"
echo "cmd1 | cmd2            # Pipe output to next command"
echo "cmd > file.txt         # Write output to file (overwrite)"
echo "cmd >> file.txt        # Append output to file"
echo "cmd 2> error.txt       # Redirect errors to file"
echo "cmd &> all.txt         # Redirect all output to file"
echo ""

# Text Processing
echo "9. TEXT PROCESSING"
echo "-----------------------------------"
echo "wc -l file.txt         # Count lines"
echo "wc -w file.txt         # Count words"
echo "sort file.txt          # Sort lines"
echo "uniq file.txt          # Remove duplicate lines"
echo "cut -d',' -f1 file.csv # Extract column from CSV"
echo "sed 's/old/new/g' file # Replace text in file"
echo "awk '{print \$1}' file # Print first column"
echo ""

# Archive & Compression
echo "10. ARCHIVE & COMPRESSION"
echo "-----------------------------------"
echo "tar -czf arch.tar.gz dir  # Create compressed archive"
echo "tar -xzf arch.tar.gz      # Extract archive"
echo "zip -r arch.zip dir       # Create zip archive"
echo "unzip arch.zip            # Extract zip archive"
echo "gzip file.txt             # Compress file"
echo "gunzip file.txt.gz        # Decompress file"
echo ""

# Network Commands
echo "11. NETWORK COMMANDS"
echo "-----------------------------------"
echo "ping google.com        # Test network connectivity"
echo "curl https://api.com   # Make HTTP request"
echo "wget https://file.com  # Download file"
echo "ifconfig               # Network interface info"
echo "netstat -tuln          # Show listening ports"
echo ""

# Git Commands
echo "12. GIT COMMANDS (BONUS)"
echo "-----------------------------------"
echo "git status             # Check repository status"
echo "git add .              # Stage all changes"
echo "git commit -m 'msg'    # Commit changes"
echo "git push               # Push to remote"
echo "git pull               # Pull from remote"
echo "git branch             # List branches"
echo "git checkout -b name   # Create new branch"
echo "git log                # View commit history"
echo ""

# Keyboard Shortcuts
echo "13. KEYBOARD SHORTCUTS"
echo "-----------------------------------"
echo "Ctrl + C               # Cancel/interrupt command"
echo "Ctrl + D               # Exit shell/EOF"
echo "Ctrl + L               # Clear screen"
echo "Ctrl + R               # Search command history"
echo "Ctrl + A               # Move to start of line"
echo "Ctrl + E               # Move to end of line"
echo "Tab                    # Auto-complete"
echo "↑/↓ arrows             # Navigate command history"
echo ""

# Variables
echo "14. VARIABLES & ENVIRONMENT"
echo "-----------------------------------"
echo "VAR='value'            # Set variable"
echo "echo \$VAR              # Print variable value"
echo "export VAR='value'     # Set environment variable"
echo "env                    # Show all environment variables"
echo "echo \$PATH             # Show PATH variable"
echo ""

# Help Commands
echo "15. GETTING HELP"
echo "-----------------------------------"
echo "man command            # Show manual for command"
echo "command --help         # Show command help"
echo "which command          # Show command location"
echo "type command           # Show command type"
echo ""

echo "=========================================="
echo "TIP: Try these commands one by one!"
echo "=========================================="
echo ""

# Prompt user to try a command
read -p "Would you like to see your current directory? (y/n): " answer
if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    echo ""
    echo "Current directory:"
    pwd
    echo ""
    echo "Files in current directory:"
    ls -la
fi

echo ""
echo "Quick Start Guide Complete!"
echo "Save this file for future reference."
