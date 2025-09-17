from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from sqlalchemy import asc, desc, or_

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
    request: Request,
    db: Session = Depends(get_db),
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0),
    search: Optional[str] = None,
    gender: Optional[Union[List[str], str]] = Query(None, description="Multiple genders allowed (comma or multiple params)"),
    class_prefix: Optional[Union[List[str], str]] = Query(None, description="Multiple class prefixes allowed (comma or multiple params)"),
    sort_by: Optional[str] = None,
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
):
    skip = (page - 1) * page_size
    query = db.query(models.Student)

    # Convert gender to list
    if gender:
        if isinstance(gender, str):
            gender = [g.strip() for g in gender.split(",") if g.strip()]
        elif isinstance(gender, list):
            gender = [g.strip() for g in gender if g.strip()]

    # Convert class_prefix to list
    if class_prefix:
        if isinstance(class_prefix, str):
            class_prefix = [c.strip() for c in class_prefix.split(",") if c.strip()]
        elif isinstance(class_prefix, list):
            class_prefix = [c.strip() for c in class_prefix if c.strip()]

    # Search
    if search:
        query = query.filter(
            (models.Student.first_name.ilike(f"%{search}%")) |
            (models.Student.last_name.ilike(f"%{search}%"))
        )

    # Gender filter (multi)
    if gender and len(gender) > 0:
        query = query.filter(models.Student.gender.in_(gender))

    # Class prefix filter (multi)
    if class_prefix and len(class_prefix) > 0:
        query = query.filter(
            or_(*[models.Student.class_name.ilike(f"{p}%") for p in class_prefix])
        )

    # Sort
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
