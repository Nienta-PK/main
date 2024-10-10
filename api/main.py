from fastapi import FastAPI, Depends, HTTPException
from routers import crud, auth, register, login, route_protector, login_history, user_by_email
from routers_algo import all_user_data, default_chioce, create_task,all_task_data
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from routers import crud, auth, register, login, route_protector
from utils.database import engine, Base
from utils.deps import AuthUser, get_current_user

# Initialize the database tables on startup
Base.metadata.create_all(bind=engine)

# Create FastAPI app instance
app = FastAPI(title="Task Manager Application")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://nextjs:3000",
    # Add more origins if necessary (e.g., production URLs)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom OpenAPI schema with JWT Bearer authentication
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Task Manager API",
        version="1.0.0",
        description="This is the API documentation for the Task Manager",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Define root route
@app.get("/")
def root():
    return {"message": "Welcome to the Task Manager API"}

# Example route for testing
@app.get("/api/python")
def hello_world():
    return {"message": "Welcome to Task Manager"}

# Route for authenticated user info
@app.get("/user/me", response_model=AuthUser)
async def read_current_user(current_user: AuthUser = Depends(get_current_user)):
    return current_user

# Include various routers for CRUD, auth, registration, and route protection
app.include_router(auth.router)         # Uncommented to include authentication router
app.include_router(crud.router)         # Router for CRUD operations (e.g., tasks)
app.include_router(register.router)     # Router for user registration
app.include_router(login.router)        # Router for user login
app.include_router(route_protector.router)  # Router for route protection (if needed)
#app.include_router(auth.router)
app.include_router(crud.router)
app.include_router(register.router)
app.include_router(login.router)
app.include_router(route_protector.router)
app.include_router(login_history.router)
app.include_router(user_by_email.router)

#algo_router
app.include_router(all_user_data.router)
app.include_router(default_chioce.router)
app.include_router(create_task.router)
app.include_router(all_task_data.router)