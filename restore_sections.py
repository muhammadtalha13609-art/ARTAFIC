import json

transcript_path = r'C:\Users\ZTUA\.gemini\antigravity\brain\2ddbba61-59a7-41cd-8a13-6d1522bccbe9\.system_generated\logs\transcript_full.jsonl'
full_html = None

# 1. Extract original HTML from transcript
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['tool_name'] == 'default_api:write_to_file' and 'index.html' in call['tool_args'].get('TargetFile', ''):
                        full_html = call['tool_args'].get('CodeContent')
        except:
            pass

if not full_html:
    print("Could not find original HTML in transcript")
    exit()

# 2. Helper to extract sections from original HTML
def get_section(content, start_marker, end_marker):
    idx1 = content.find(start_marker)
    idx2 = content.find(end_marker)
    if idx1 != -1 and idx2 != -1:
        return content[idx1:idx2]
    return ""

problem_html = get_section(full_html, "<!-- ═══════════════════════════════════════════════════════════\n     PROBLEM SECTION", "<!-- ═══════════════════════════════════════════════════════════\n     SERVICES")
why_html = get_section(full_html, "<!-- ═══════════════════════════════════════════════════════════\n     WHY ARTAFIC", "<!-- ═══════════════════════════════════════════════════════════\n     BEFORE / AFTER SLIDER")
cta_html = get_section(full_html, "<!-- ═══════════════════════════════════════════════════════════\n     CONVERSION CTA", "<!-- ═══════════════════════════════════════════════════════════\n     FAQ SECTION")

if not problem_html or not why_html or not cta_html:
    print("Failed to extract one or more sections from original HTML")
    exit()

# 3. Read current HTML and inject them back in
with open('G:/PC Data 16-09-25/ZTUA/Desktop/ARTAFIC/index.html', 'r', encoding='utf-8') as f:
    current_html = f.read()

# Insert Problem before Services
services_marker = "<!-- ═══════════════════════════════════════════════════════════\n     SERVICES"
current_html = current_html.replace(services_marker, problem_html + services_marker)

# Insert Why ARTAFIC before Before/After (wait, Before/After was moved above Process!)
# Actually, the user's current flow is: Services -> Before/After -> Process -> About Me -> FAQ
# So I should put Why ARTAFIC after Process, or just where it was originally (before Before/After... but Before/After moved!)
# Let's put Why ARTAFIC right before 'About Me'.
about_marker = "<!-- ═══════════════════════════════════════════════════════════\n     ABOUT ME SECTION"
current_html = current_html.replace(about_marker, why_html + about_marker)

# Insert CTA before FAQ
faq_marker = "<!-- ═══════════════════════════════════════════════════════════\n     FAQ SECTION"
current_html = current_html.replace(faq_marker, cta_html + faq_marker)

with open('G:/PC Data 16-09-25/ZTUA/Desktop/ARTAFIC/index.html', 'w', encoding='utf-8') as f:
    f.write(current_html)

print("Successfully restored all three sections!")
