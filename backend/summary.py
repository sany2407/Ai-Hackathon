import datetime
import uuid
from langchain.tools import Tool

def generate_changelog_entry(execution_log: dict, is_voice_edit: bool = False) -> dict:
    """
    Generates a human-readable changelog entry from execution logs.
    Input:
        execution_log: dict with keys like 'operation', 'parameters', 'result', etc.
        is_voice_edit: bool, whether this was triggered by a voice command.
    Output:
        dict with 'entry', 'timestamp', 'rollback_id', 'is_voice_edit'
    """
    operation = execution_log.get('operation', 'unknown operation')
    params = execution_log.get('parameters', {})
    result = execution_log.get('result', '')
    # Example: Inserted testimonials section above footer
    if operation == 'insert':
        entry = f"Inserted {params.get('type', 'block')} {params.get('location', '')}".strip()
    elif operation == 'delete':
        entry = f"Deleted {params.get('target_selector', 'element')}"
    elif operation == 'replace':
        entry = f"Replaced {params.get('target_selector', 'element')}"
    else:
        entry = f"Performed {operation}"
    if is_voice_edit:
        entry = "[Voice] " + entry
    timestamp = datetime.datetime.utcnow().isoformat() + 'Z'
    rollback_id = str(uuid.uuid4())
    return {
        "entry": entry,
        "timestamp": timestamp,
        "rollback_id": rollback_id,
        "is_voice_edit": is_voice_edit
    }

summary_tool = Tool(
    name="generate_changelog_entry",
    description="Generates a human-readable changelog entry from execution logs. Input: execution_log (dict), is_voice_edit (bool, optional). Returns dict with entry, timestamp, rollback_id, and is_voice_edit.",
    func=generate_changelog_entry
)
