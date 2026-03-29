import os

root_dir = r"c:\Users\RAHUL KUMAR BHADRA\Desktop\Project Nana\puja-connect-pro-main\api"

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".py"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Replace 'from app.' with 'from '
            new_content = content.replace("from app.", "from ")
            # In case of 'import app.'
            new_content = new_content.replace("import app.", "import ")
            
            if content != new_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed imports in: {file_path}")
