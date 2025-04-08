import os


def copy_directory_without_comments(source_dir: str, destination_dir: str):
    # Create the destination directory if it doesn't exist
    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)

    # Walk through the source directory
    for root, dirs, files in os.walk(source_dir):
        # Create corresponding subdirectories in the destination
        for dir_name in dirs:
            source_subdir = os.path.join(root, dir_name)
            dest_subdir = os.path.join(
                destination_dir, os.path.relpath(source_subdir, source_dir)
            )
            if not os.path.exists(dest_subdir):
                os.makedirs(dest_subdir)

        # Process files
        for file_name in files:
            source_file = os.path.join(root, file_name)
            dest_file = os.path.join(
                destination_dir, os.path.relpath(source_file, source_dir)
            )

            # Copy and process the file
            with open(source_file, "r") as src, open(dest_file, "w") as dst:
                for line in src:
                    if not line.lstrip().startswith("//"):
                        dst.write(line)
