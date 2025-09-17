from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import asc, desc

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


# Get list students
@app.get("/students/", response_model=schemas.StudentList)
def get_students(
    db: Session = Depends(get_db),
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0),
    search: Optional[str] = None,
    gender: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
):
    skip = (page - 1) * page_size
    query = db.query(models.Student)

    # Filter
    # Search
    if search:
        query = query.filter(
            (models.Student.first_name.ilike(f"%{search}%")) |
            (models.Student.last_name.ilike(f"%{search}%"))
        )

    # Gender
    if gender and gender.lower() != "all":
        query = query.filter(models.Student.gender == gender)

    # Dynamic Sort
    if sort_by and hasattr(models.Student, sort_by):
        sort_column = getattr(models.Student, sort_by)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(models.Student.id.desc())  # default

    total = query.count()
    students = query.offset(skip).limit(page_size).all()

    return {"items": students, "total": total}

# Get detail
@app.get("/students/{student_id}", response_model=schemas.Student)
def get_student_detail(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# Create
@app.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = models.Student(
        first_name=student.first_name,
        last_name=student.last_name,
        class_name=student.class_name,
        gender=student.gender,
        dob=student.dob,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

# Update
@app.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student_data: schemas.StudentCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student.first_name = student_data.first_name
    student.last_name = student_data.last_name
    student.class_name = student_data.class_name
    student.gender = student_data.gender
    student.dob = student_data.dob
    
    db.commit()
    db.refresh(student)
    return student

# Delete
@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
