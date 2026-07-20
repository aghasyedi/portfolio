import os
import glob

def fix_navbar(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Check if Map is already in the nav-links
    if 'href="' in content and '>Map<' in content:
        # Might already have it, but let's be careful. Let's just look for journey.html
        pass

    if 'href="../map.html"' in content or 'href="../../map.html"' in content or 'href="map.html"' in content:
        if 'Map<' in content:
            print(f"Skipping {filepath}, already has Map")
            return

    # Find the journey link to figure out the correct relative path level
    import re
    # Look for the journey link. It could be href="journey.html", href="../journey.html", or href="../../journey.html"
    match = re.search(r'<a href="([^"]*)journey\.html"[^>]*>.*?</a>', content, re.DOTALL)
    if not match:
        print(f"Could not find journey link in {filepath}")
        return

    prefix = match.group(1)
    journey_link_full = match.group(0)

    map_link = f'\n            <a href="{prefix}map.html" class="transition-link">Map</a>'
    
    new_content = content.replace(journey_link_full, journey_link_full + map_link)
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

files = glob.glob('/Users/aghatasheersyedi/Desktop/latex/class/qiskit/portfolio/**/*.html', recursive=True)
for file in files:
    if 'nav-links' in open(file).read():
        fix_navbar(file)

