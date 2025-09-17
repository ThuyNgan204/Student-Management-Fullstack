from pydantic import BaseModel
from typing import List
from datetime import date, datetime

class StudentBase(BaseModel):
    name: str
    class_name: str
    gender: str
    dob: date

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentList(BaseModel):
    items: List[Student]
    total: int
