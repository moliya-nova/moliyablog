from fastapi import APIRouter

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/query")
async def query(question: str):
    # TODO: implement RAG query endpoint
    return {"answer": ""}


@router.post("/index")
async def index():
    # TODO: trigger indexing
    return {"status": "ok"}
