#!/bin/bash

# Initialize shadcn components
pnpm dlx shadcn@latest init

# Add commonly used components
components=(
  "accordion"
  "alert"
  "alert-dialog"
  "aspect-ratio"
  "avatar"
  "badge"
  "button"
  "calendar"
  "card"
  "checkbox"
  "collapsible"
  "command"
  "context-menu"
  "dialog"
  "dropdown-menu"
  "form"
  "hover-card"
  "input"
  "label"
  "menubar"
  "navigation-menu"
  "popover"
  "progress"
  "radio-group"
  "scroll-area"
  "select"
  "separator"
  "sheet"
  "skeleton"
  "slider"
  "switch"
  "table"
  "tabs"
  "textarea"
  "toast"
  "toggle"
  "tooltip"
)

# Add each component
for component in "${components[@]}"; do
  pnpm dlx shadcn@latest add "$component" --yes
done
