# Kanban Todo List App

A full-featured, responsive Kanban board application built with Next.js. This application allows users to manage tasks effectively using a drag-and-drop interface across customizable columns.

## ✨ Features

- **Drag and Drop Interface**: Fluid drag-and-drop task management powered by `@dnd-kit/core` supporting multiple sortable lists.
- **Task Management**: Create, read, update, and delete tasks.
- **Form Validation**: Robust form handling and validation using `react-hook-form` and `zod`.
- **Real-time Feedback**: Beautiful toast notifications for user actions via `react-hot-toast`.
- **Mock Backend Integration**: Persistent data storage during development utilizing `json-server`.
- **Responsive Design**: Clean and modern UI that adapts perfectly to desktop and mobile environments.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Mock API**: [JSON Server](https://github.com/typicode/json-server)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm) installed on your system.

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository (if applicable) or download the source code:
   ```bash
   git clone <repository-url>
   cd kanban-todo-list-app
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the Application

This project requires both the Next.js frontend server and the JSON Server mock backend to be running simultaneously.

1. **Start the Mock API Server**:
   Open a terminal window and run:
   ```bash
   npm run server
   # This typically runs `json-server --watch db.json --port 3001` or similar
   ```

2. **Start the Next.js Development Server**:
   Open a second terminal window and run:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application should now be fully interactive and communicating with your local mock API.

## 📁 Project Structure

A brief overview of the core directories:

```
kanban-todo-list-app/
├── public/             # Static assets (images, icons, etc.)
├── src/
│   ├── api/            # API integration calls and fetch logic
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # Reusable React components (KanbanBoard, TaskDialog, etc.)
│   ├── theme/          # Custom theme configurations (if applicable)
│   └── ...
├── db.json             # Local JSON database for the mock API backend
└── package.json        # Project dependencies and npm scripts
```

## 🌐 API

The application utilizes a REST-like API powered by `json-server`. By default, tasks are divided into specific statuses/columns:
- `backlog`
- `in_progress`
- `review`
- `done`

The primary endpoint for retrieving and modifying task lists is `/tasks`. 

## ☁️ Deployment

This Next.js application is designed to be easily deployable on Vercel. 

> **Note on `json-server` in Production:** 
> When deploying to serverless platforms like Vercel, `json-server` cannot run as a persistent background process. For a complete production deployment, the backend should be migrated to a dedicated database service (e.g., Supabase, Firebase, or MongoDB) or the JSON API can be hosted separately on platforms like Render or Railway.

For a pure frontend deployment:
1. Push your code to a Git repository.
2. Import the project into your Vercel dashboard.
3. Configure your environment variables to point to your updated production API URL.

---
*Created with Next.js*
