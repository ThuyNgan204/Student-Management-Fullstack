from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.responses import JSONResponse

from . import models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/students/")
def get_students(
    db: Session = Depends(get_db),
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0),
    search: Optional[str] = None
):
    skip = (page - 1) * page_size
    query = db.query(models.Student).order_by(models.Student.id.desc())

    if search:
        query = query.filter(models.Student.name.ilike(f"%{search}%"))

    total = query.count()
    students = query.offset(skip).limit(page_size).all()

    return {"items": students, "total": total}

@app.get("/students/{student_id}", response_model=schemas.Student)
def get_student_detail(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = models.Student(name=student.name, class_name=student.class_name)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student_data: schemas.StudentCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student.name = student_data.name
    student.class_name = student_data.class_name
    
    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}