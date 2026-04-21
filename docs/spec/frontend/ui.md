# UI Design - TDD Todo App

## Overview

This document describes the user interface design for the TDD Todo Application. The application provides a web interface to manage Apps and Todos using React and Tailwind CSS.

**Framework**: React 19  
**Styling**: Tailwind CSS  
**Navigation**: Page-based routing (transitions)  
**State Management**: React hooks / Context API

---

## Page Structure

```
features/
├── app-list/
│   ├── components/
│   │   ├── AppList.tsx
│   │   ├── AppCard.tsx
│   │   └── CreateAppButton.tsx
│   └── pages/
│       └── AppListPage.tsx
├── app-detail/
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   └── CreateTodoButton.tsx
│   └── pages/
│       └── AppDetailPage.tsx
├── app-create/
│   ├── components/
│   │   └── AppForm.tsx
│   └── pages/
│       └── AppCreatePage.tsx
└── app-edit/
    ├── components/
    │   └── AppForm.tsx
    └── pages/
        └── AppEditPage.tsx
```

---

## Pages

### 1. App List Page

**Route**: `/apps`  
**Purpose**: Display all Apps, create new App, manage existing Apps

**Layout**:

```
┌─────────────────────────────────────┐
│  Todo App TDD                       │ (Header)
├─────────────────────────────────────┤
│  [+ Create App]                     │ (Action bar)
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ App Name 1                      ││
│  │ Created: 2026-04-12             ││
│  │ [View]                          ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ App Name 2                      ││
│  │ Created: 2026-04-12             ││
│  │ [View]                          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Components**:

- `AppList`: Container for all apps
- `AppCard`: Individual app item card with View button
- `CreateAppButton`: Button to create new app

**Functionality**:

- Display all active Apps
- Navigate to App Detail on "View"
- Navigate to App Create on "+ Create App"

---

### 2. App Detail Page

**Route**: `/apps/{appId}`  
**Purpose**: View App details and manage associated Todos

**Layout**:

```
┌─────────────────────────────────────┐
│  [← Back]  App Name  [Edit] [Delete]│ (Header)
├─────────────────────────────────────┤
│  Created: 2026-04-12                │
│  Updated: 2026-04-12                │
├─────────────────────────────────────┤
│  Todos                              │
│  [+ Create Todo]                    │ (Action bar)
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ ☐ Todo 1                       ││
│  │ Created: 2026-04-12             ││
│  │ [Edit] [Delete]                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ☑ Todo 2 (completed)           ││
│  │ Created: 2026-04-12             ││
│  │ [Edit] [Delete]                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Edit Mode] Todo Item           ││
│  │ [Input field for todo title]    ││
│  │ Status: ☐ Pending (read-only)   ││
│  │ [Cancel] [Save]                 ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Components**:

- `AppHeader`: App name, timestamps, edit/delete buttons in action bar
- `TodoList`: List of todos
- `TodoItem`: Individual todo card with status checkbox, Edit and Delete buttons
- `TodoForm`: Inline form for editing todo title and completion status
- `CreateTodoButton`: Button to create new todo inline

**Functionality**:

- Display App details
- Display edit/delete buttons in header action bar
- List all Todos for the App
- Toggle completion status via checkbox
- Click "[Edit]" to switch todo into edit mode (inline form)
- Edit todo title only in edit mode
- **Status (pending/completed) cannot be changed in edit mode** (displayed as read-only)
- Click "[Cancel]" to exit edit mode without saving
- Click "[Save]" to submit `PUT /api/v1/apps/{appId}/todos/{todoId}` (title change only)
- Click "[Delete]" to soft delete todo with confirmation → show success toast
- Click "[+ Create Todo]" to show inline create form
- Create todo with title and submit `POST /api/v1/apps/{appId}/todos`
- Navigate to App Edit on "Edit" button in header
- Soft delete App on "Delete" button in header with confirmation → show success toast

---

### 3. App Create Page

**Route**: `/apps/create`  
**Purpose**: Create a new App

**Layout**:

```
┌─────────────────────────────────────┐
│  Create New App                     │ (Title)
├─────────────────────────────────────┤
│  App Name *                         │
│  ┌─────────────────────────────────┐│
│  │ Enter app name...               ││
│  └─────────────────────────────────┘│
│                                     │
│  [Cancel]                   [Create]│
└─────────────────────────────────────┘
```

**Components**:

- `AppForm`: Input form for app name
- Button: Cancel, Create

**Functionality**:

- Validate App name (required, max 100 chars)
- Submit to `POST /api/v1/apps`
- Display error message on validation failure (422)
- Display error message on duplicate name (409)
- Navigate to App List on success
- Navigate back on Cancel

---

### 4. App Edit Page

**Route**: `/apps/{appId}/edit`  
**Purpose**: Edit existing App

**Layout**:

```
┌─────────────────────────────────────┐
│  Edit App                           │ (Title)
├─────────────────────────────────────┤
│  App Name *                         │
│  ┌─────────────────────────────────┐│
│  │ Current app name...             ││
│  └─────────────────────────────────┘│
│                                     │
│  [Cancel]                   [Update]│
└─────────────────────────────────────┘
```

**Components**:

- `AppForm`: Input form pre-filled with current app name
- Button: Cancel, Update

**Functionality**:

- Pre-fill form with current App data
- Validate App name (required, max 100 chars)
- Submit to `PUT /api/v1/apps/{appId}`
- Display error message on validation failure (422)
- Display error message on duplicate name (409)
- Navigate to App Detail on success
- Navigate back on Cancel

---

## Components

### AppCard

- Display App name and timestamps
- Show View action button
- Responsive design with Tailwind

### AppForm

- Input field for App name
- Validation feedback
- Loading state during submission
- Error display

### TodoItem

- Display todo title and status (checkbox)
- Show Edit and Delete buttons
- Display timestamps
- Toggle completion status via checkbox
- Switch to inline edit mode on Edit button

### TodoForm

- Input field for Todo title (editable)
- **Status field is read-only/disabled** (displayed but cannot be changed in edit mode)
- Validation feedback
- Loading state during submission
- Error display
- Used for both inline edit and inline create modes
  - **Edit mode**: Title is editable, Status is disabled (read-only)
  - **Create mode**: Title is editable, Status defaults to not completed

### TodoList

- Render list of TodoItem components
- Handle empty state message
- Support inline edit/create/delete operations

---

## Interactions & Behaviors

### Error Handling

- **422 (Validation Error)**: Display field-level error messages
  - Example: "App name is required" or "App name must not exceed 100 characters"
- **409 (Conflict)**: Display error message
  - Example: "App name 'MyApp' already exists"
- **404 (Not Found)**: Navigate to error page or back to list
- **500 (Server Error)**: Display generic error message with retry option

### Toast Notifications

- **On Successful Delete (App)**: Show success toast
  - "App deleted successfully", then navigate to App List after 2 seconds
- **On Successful Delete (Todo)**: Show success toast
  - "Todo deleted successfully", then navigate to App Detail after 2 seconds
- **On Error**: Show error toast with error message

### Loading States

- Show loading spinner during API calls
- Disable submit button during submission
- Show loading skeleton for initial page load

### Confirmation Dialogs

- Confirm deletion with dialog before soft deleting
- Show warning message about cascading deletes for Apps

### Data Binding

- Use React hooks (useState, useEffect) for form management
- Use Context API or custom hooks for shared state
- Fetch data on component mount and handle loading/error states

---

## Styling Guidelines

**Tailwind CSS** classes for:

- **Colors**: Primary (blue), Secondary (gray), Success (green), Error (red)
- **Spacing**: Use consistent padding/margin scale
- **Typography**: Clear hierarchy with heading sizes
- **Responsive**: Mobile-first approach (sm, md, lg breakpoints)
- **Interactive**: Hover, focus, active states for buttons and inputs

### Component Styling Examples

```jsx
// Button
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Create
</button>

// Input
<input className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Card
<div className="p-4 bg-white border border-gray-200 rounded shadow hover:shadow-lg">
  {/* Content */}
</div>
```

---

## Routing Map

| Page       | Route                | Purpose            |
| ---------- | -------------------- | ------------------ |
| App List   | `/apps`              | Browse all apps    |
| App Detail | `/apps/{appId}`      | Manage app & todos |
| App Create | `/apps/create`       | Create new app     |
| App Edit   | `/apps/{appId}/edit` | Edit app           |

---

## Data Flow

```
App List
  ↓ (click View)
App Detail
  ├─ (click Edit App) → App Edit → (save) → App Detail
  ├─ (click Delete App) → confirmation → App List (with success toast)
  ├─ (click + Create Todo) → inline form appears
  ├─ (fill title, click Create Todo) → save → refresh list
  └─ Todo in list
      ├─ (click [Edit]) → inline edit form appears
      ├─ (edit title/status, click Save) → save → refresh list
      └─ (click [Delete]) → confirmation → delete → refresh list (with success toast)
```
