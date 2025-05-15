from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from rag_pipeline import (
    parse_pdf,
    docs_to_string_chunks,
    faiss_vectorize_chunks,
    create_chain,
    get_rag_context,
    embedding_model,
)
from langchain_community.vectorstores import FAISS
import os
import uuid

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FAISS_DIR = "faiss_store"

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1]
    filename = f"temp_{uuid.uuid4()}.{ext}"
    with open(filename, "wb") as f:
        f.write(await file.read())

    docs = parse_pdf(filename)
    chunks = docs_to_string_chunks(docs)
    faiss_index = faiss_vectorize_chunks(chunks)
    faiss_index.save_local(FAISS_DIR)
    os.remove(filename)

    return {"status": "PDF processed", "num_chunks": len(chunks)}

@app.post("/ask")
async def ask_question(question: str = Form(...)):
    faiss_index = FAISS.load_local(FAISS_DIR, embedding_model, allow_dangerous_deserialization=True)
    context = get_rag_context(faiss_index, question)
    chain = create_chain()
    output = chain.invoke({"context": context, "question": question})
    return {"answer": output.content,
            "context": context
            }