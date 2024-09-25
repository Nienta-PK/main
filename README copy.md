# Next.js + Docker Project

This project is a Next.js application containerized with Docker. It uses Docker Compose to simplify development and dependency management, including building and running the application. The project also integrates **Material UI** for creating a responsive and sleek user interface.

This project is developed for GUI chapter of the Advance Computer Programming class under the Department of Robotics and AI Engineering, School of Engineering, KMITL.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/syanyong/acpfrontend.git
   cd acpfrontend
   ```

2. Build and start the application using Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

### Running the Application

- The application will be available at `http://localhost:3000`.
- It uses hot-reloading for development, so any changes in your source code will automatically reflect on the application.

### Building the Production Image

To build a production-ready Docker image, run:

```bash
docker-compose build
```

## Project Structure

```plaintext
.
├── docker-compose.yaml    # Docker Compose configuration
├── nextjs/
│   ├── components/        # React components for the project
│   ├── pages/             # Next.js pages
│   ├── public/            # Static assets
│   ├── Dockerfile         # Dockerfile for building the Next.js app
│   ├── jsconfig.json      # JS configuration for path aliases
│   ├── next.config.mjs    # Next.js configuration file
│   ├── package.json       # Project dependencies and scripts
│   └── .gitignore         # Ignored files for Git
```

### The `pages` Folder (**Main folder to implement)

In a Next.js project, the `pages` folder is central to defining the routes for your application. Each file inside the `pages` directory corresponds to a route based on its file name:

- **`index.js`**: The main landing page of your application, accessible at the root URL (`/`). This is where you'll typically start developing the homepage or entry point of your application.
  
- **Dynamic Routing**: You can also create dynamic routes using square brackets. For example, `pages/[id].js` would map to routes like `/123`, `/about`, etc., allowing you to fetch dynamic content based on the route parameter.

Example structure:
```plaintext
pages/
├── index.js           # Home page
├── about.js           # Example page for /about route
├── [id].js            # Dynamic route for URLs with /id
```

In this project, all the front-end routes and logic for the UI are defined within this folder. The structure helps you easily create and manage routes, and you can also introduce dynamic pages as needed.

To see a simple example of a Next.js page, you can refer to pages/page1.js. It contains the structure for defining a component-based page that is accessible through /page1. You can use this as a reference to add more pages to your project.

## API Proxy Configuration
The project is configured with an API proxy to handle backend requests seamlessly. All routes that begin with /api will be redirected to the backend server running on http://backend:8000. This ensures that API calls are proxied to the backend service without the need to modify frontend code.

This proxy configuration can be modified or updated inside the next.config.mjs file:

## Key Technology

- **Next.js Framework**: Utilizes Next.js for server-side rendering and static generation.
- **Dockerized**: Easy to build and deploy using Docker, ensuring consistency across environments.
- **MUI (Material UI)**: For building a responsive and elegant UI.
- **State Management**: Uses `zustand` for state management.

## Implementing with Material UI

This project uses [Material UI (MUI)](https://mui.com/material-ui/getting-started/overview/) to enhance the user interface design and development. MUI is a popular React component library that provides pre-built, customizable UI components based on Google's Material Design guidelines.

