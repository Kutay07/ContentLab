I want you to create a reusable React component called ComponentEditDrawer (with TypeScript) that will be used to edit or create a ComponentItem inside my Content Editor application.

Project Stack
    Next.js (latest version)
    Tailwind CSS
    React (Client Components)
    Optional: React Monaco Editor for the JSON tab (small editor version)

Purpose

The drawer will open when the user clicks on a "+" button between components and selects a ComponentType from a menu.
The drawer will also be used when the user edits an existing component.
The user should be able to:
    See a preview of the component (MobileScreenContainer) on the left
    Edit the component content via:
        JSON Editor tab (Monaco)
        Form Editor tab (auto-generated fields based on JSON)
    (Later) Use LLM tools in a 3rd tab (empty for now)
    Edit the component order
    Save or cancel the edit
    Saving should use my ContentHierarchyService and create an undo/redo entry.

Data Structures
ComponentType
```
type ComponentType = {
  content_template: Json | null;
  created_at: string | null;
  description: string | null;
  display_name: string;
  estimated_duration_minutes: number | null;
  icon_family: string | null;
  icon_key: string | null;
  id: string;
  is_active: boolean | null;
  type_key: string;
  updated_at: string | null;
};
```

ComponentItem
```
interface ComponentItem {
  id: string;
  type: string;
  display_name: string;
  content: Json;
  order: number;
}
```

Component API
```
interface ComponentEditDrawerProps {
  levelId: string; // The level where the component belongs
  componentType: ComponentType; // component_types.Row selected from menu
  componentId?: string; // Existing componentId if editing, undefined if creating new
  initialContent?: Json; // For editing an existing component or for preloading template content
  initialOrder: number; // Order value passed based on the position of "+" button clicked
  onClose: () => void; // Called when drawer is closed
}
```

Behavior
    The drawer should be large, similar to a Blackboard-style drawer
    The drawer opens from the right side
    The drawer should have:

Header
    Close button (X)
    Component type display_name and type_key or id

Left Panel
    MobileScreenContainer rendering the current contentJson state

Right Panel (Tabs)
Tab 1 - JSON Editor
    A small Monaco Editor or similar component
    Editing the JSON should update contentJson state
    Invalid JSON should be gracefully handled (warn the user)

Tab 2 - Form Editor
    Auto-generate form fields based on contentJson keys:
        Primitive fields:
            string → text input or textarea
            number → number input
            boolean → checkbox
        Changes in the form should update contentJson state (two-way binding with JSON editor)

Tab 3 - LLM Tab
    Empty placeholder (for future LLM tools integration)
    Just show a message "LLM tools will be here."

Bottom Bar
    Order input field (number input)
    Save button
    Cancel button

Save behavior
    If componentId is provided (editing existing component):
        Call: ContentHierarchyService.updateComponent(componentId, { content: contentJson, order })
    If creating new component:
        Build new ComponentItem with:
            id = new UUID (uuidv4 or similar)
            type = componentType.type_key
            display_name = componentType.display_name
            content = contentJson
            order = order
        Call: ContentHierarchyService.addComponent(levelId, newComponent)
    Both actions must trigger ContentHierarchyService so that undo/redo history is correctly updated.
    After saving, call onClose().

Styling
    Use Tailwind CSS for styling
    Large drawer (full height)
    Split layout (left panel for MobileScreenContainer, right panel for tabs)
    Responsive layout
    Smooth opening/closing

Constraints
    Do not use any third-party UI libraries (no Radix, MUI, etc.)
    You can use react-monaco-editor or similar for Monaco integration (mention if needed)
    Must be fully typed with TypeScript
    Must be modular and reusable
    Must be easy to integrate into my current React app
    Must use local component state to manage contentJson and order values
    Do not implement any global state or API logic

Deliverables
    Full ComponentEditDrawer.tsx component
    Example usage with mock data:
        Example ComponentType
        Example initialContent
        Example initialOrder
        Example onClose

    Include all required sub-components if needed (ex: ComponentEditTabs, ComponentEditFormTab, ComponentEditJsonTab, ComponentEditLLMTab)
    MobileScreenContainer should be used on the left and show a live preview of the current contentJson.

Important: The drawer will be opened either when a "+" button is clicked and a ComponentType is selected, or when editing an existing component.

Summary
You are building a large editor drawer component that will allow creating and editing components inside my Content Editor app.
The drawer must support JSON and Form editing of component content, preview the component, and integrate with my ContentHierarchyService for undo/redo support.

This is the full scope of the component.
Please generate clean, modular, and well-typed code that is easy to integrate.