from bs4 import BeautifulSoup
from langchain.tools import Tool

def execute_dom_operation(dom_html: str, operation: str, parameters: dict) -> str:
    """
    Executes the specified operation on the live web DOM.
    Input:
        dom_html: The current HTML as a string.
        operation: The operation to perform (e.g., 'insert', 'delete', 'replace').
        parameters: Dict of parameters for the operation (e.g., target selector, content, position).
    Output:
        Updated DOM as a string.
    """
    soup = BeautifulSoup(dom_html, 'html.parser')
    try:
        if operation == 'insert':
            # Example: parameters = {'target_selector': '#footer', 'content': '<section>...</section>', 'position': 'before'}
            target = soup.select_one(parameters.get('target_selector'))
            new_content = BeautifulSoup(parameters.get('content', ''), 'html.parser')
            position = parameters.get('position', 'before')
            if target:
                if position == 'before':
                    target.insert_before(new_content)
                elif position == 'after':
                    target.insert_after(new_content)
                elif position == 'append':
                    target.append(new_content)
        elif operation == 'delete':
            # Example: parameters = {'target_selector': '#hero'}
            target = soup.select_one(parameters.get('target_selector'))
            if target:
                target.decompose()
        elif operation == 'replace':
            # Example: parameters = {'target_selector': '#header', 'content': '<header>New</header>'}
            target = soup.select_one(parameters.get('target_selector'))
            new_content = BeautifulSoup(parameters.get('content', ''), 'html.parser')
            if target:
                target.replace_with(new_content)
        # Add more operations as needed
    except Exception as e:
        # If anything goes wrong, return the original DOM
        return dom_html
    return str(soup)

# Tool wrapper for agent use
executor_tool = Tool(
    name="execute_dom_operation",
    description="Executes a DOM operation (insert, delete, replace) on the provided HTML. Input: dom_html (str), operation (str), parameters (dict). Returns updated HTML.",
    func=execute_dom_operation
)
