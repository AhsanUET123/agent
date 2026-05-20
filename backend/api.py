from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orchestrator.ciro_orchestrator import CIROOrchestrator

app = FastAPI()

# ✅ Middleware must come AFTER app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = CIROOrchestrator()


@app.get("/run")
def run_system(input_text: str):
    result = orchestrator.run_pipeline(input_text)
    return result


@app.get("/")
def home():
    return {
        "status": "CIRO System Running 🚀",
        "endpoints": {
            "run": "/run?input_text=your_text"
        }
    }