#!/usr/bin/env python3
"""
Smart Desktop Organizer
Automatically sorts files on desktop by type and date
"""

import subprocess
import json

def organize_by_file_type():
    """Organize files by their type using AppleScript"""
    
    # Script to organize different file types
    applescript = '''
    tell application "Finder"
        activate
        set desktop_path to path to desktop
        
        -- Get all files on desktop (excluding folders)
        set desktop_files to (every file of desktop_path)
        
        repeat with this_file in desktop_files
            set file_name to name of this_file
            set file_extension to name extension of this_file
            
            -- Images
            if file_extension is in {"jpg", "jpeg", "png", "gif", "bmp", "tiff", "heic"} then
                try
                    move this_file to folder "📁 Personal Files" of desktop_path
                end try
            
            -- Documents  
            else if file_extension is in {"pdf", "doc", "docx", "txt", "rtf", "pages"} then
                try
                    move this_file to folder "📁 Work Projects" of desktop_path
                end try
            
            -- Archives
            else if file_extension is in {"zip", "rar", "7z", "tar", "gz"} then
                try
                    move this_file to folder "📁 Downloads to Sort" of desktop_path
                end try
            
            -- Code files
            else if file_extension is in {"py", "js", "html", "css", "json", "md"} then
                try
                    move this_file to folder "📁 Work Projects" of desktop_path
                end try
            
            -- Screenshots (based on name pattern)
            else if file_name starts with "Screenshot" or file_name starts with "desktop" then
                try
                    move this_file to folder "📁 Screenshots" of desktop_path
                end try
            end if
        end repeat
        
        return "Organization complete!"
    end tell
    '''
    
    try:
        result = subprocess.run(['osascript', '-e', applescript], 
                              capture_output=True, text=True)
        return {
            "status": "success",
            "message": "Desktop organized by file type!",
            "output": result.stdout.strip()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def clean_empty_folders():
    """Remove empty folders from desktop"""
    applescript = '''
    tell application "Finder"
        set desktop_path to path to desktop
        set folder_list to (every folder of desktop_path)
        
        repeat with this_folder in folder_list
            if (count of items in this_folder) is 0 then
                try
                    delete this_folder
                end try
            end if
        end repeat
        
        return "Empty folders cleaned!"
    end tell
    '''
    
    try:
        result = subprocess.run(['osascript', '-e', applescript], 
                              capture_output=True, text=True)
        return {"status": "success", "message": result.stdout.strip()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_desktop_stats():
    """Get statistics about desktop organization"""
    applescript = '''
    tell application "Finder"
        set desktop_path to path to desktop
        set file_count to count of files in desktop_path
        set folder_count to count of folders in desktop_path
        set total_items to count of items in desktop_path
        
        return "Files: " & file_count & ", Folders: " & folder_count & ", Total: " & total_items
    end tell
    '''
    
    try:
        result = subprocess.run(['osascript', '-e', applescript], 
                              capture_output=True, text=True)
        return {"status": "success", "stats": result.stdout.strip()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python3 organize_desktop.py [organize|clean|stats]")
        print("  organize - Sort files by type")
        print("  clean    - Remove empty folders") 
        print("  stats    - Show desktop statistics")
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == "organize":
        result = organize_by_file_type()
    elif action == "clean":
        result = clean_empty_folders()
    elif action == "stats":
        result = get_desktop_stats()
    else:
        result = {"status": "error", "message": f"Unknown action: {action}"}
    
    print(json.dumps(result, indent=2)) 