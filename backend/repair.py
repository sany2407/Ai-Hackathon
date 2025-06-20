from bs4 import BeautifulSoup
from langchain.tools import Tool
import re

def feedback_and_repair(dom_html: str, changelog: list) -> dict:
    """
    Monitors the DOM post-edit for layout issues or failed changes and recommends or applies fixes.
    Input:
        dom_html: The current HTML as a string (post-edit)
        changelog: List of changelog entries
    Output:
        dict with 'success' (bool), 'repair_action' (str), and 'message' (str)
    """
    soup = BeautifulSoup(dom_html, 'html.parser')
    issues = []
    repair_action = None
    # Example: Detect overlapping sections (very basic check)
    sections = soup.find_all('section')
    ids = set()
    for section in sections:
        section_id = section.get('id')
        if section_id:
            if section_id in ids:
                issues.append(f"Duplicate section id: {section_id}")
                # Auto-fix: remove duplicate id
                section['id'] = section_id + '_dup'
                repair_action = f"Renamed duplicate section id {section_id} to {section_id}_dup"
            else:
                ids.add(section_id)
    # Example: Check for missing required elements
    if not soup.find('footer'):
        issues.append("Missing <footer> element")
        # Auto-fix: add a basic footer
        new_footer = soup.new_tag('footer')
        new_footer.string = "Footer added by repair agent."
        soup.body.append(new_footer)
        repair_action = "Added missing <footer> element."
    # Example: Check for empty sections
    for section in sections:
        if not section.text.strip():
            issues.append(f"Empty section detected (id={section.get('id', 'none')})")
            section.string = "Placeholder content."
            repair_action = f"Filled empty section (id={section.get('id', 'none')}) with placeholder content."
    # Add more UI/layout checks as needed
    if issues:
        return {
            "success": False,
            "repair_action": repair_action or "Manual review needed.",
            "message": "; ".join(issues),
            "repaired_dom": str(soup)
        }
    else:
        return {
            "success": True,
            "repair_action": "No issues detected.",
            "message": "DOM is healthy.",
            "repaired_dom": str(soup)
        }

repair_tool = Tool(
    name="feedback_and_repair",
    description="Monitors the DOM post-edit for layout issues or failed changes and recommends or applies fixes. Input: dom_html (str), changelog (list). Returns dict with success, repair_action, message, and repaired_dom.",
    func=feedback_and_repair
)
