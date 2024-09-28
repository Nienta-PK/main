from fastapi import FastAPI, Depends, HTTPException
from routers import crud, auth, register, login, route_protector
from fastapi.middleware.cors import CORSMiddleware
from utils.database import engine, Base,SessionLocal 
from fastapi.openapi.utils import get_openapi

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Task Manager Application")
origins = [
    "http://localhost:3000",
    "http://nextjs:3000",
    # Add any other origins if necessary
]
app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
        )  

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Your API",
        version="1.0.0",
        description="Your API description",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
def root():
    return {"message": "Welcome to my API"}

@app.get("/api/python")
def hello_world():
    return {"message": "Welcome to Task Manager"}

#app.include_router(auth.router)
app.include_router(crud.router)
app.include_router(register.router)
app.include_router(login.router)
app.include_router(route_protector.router)
