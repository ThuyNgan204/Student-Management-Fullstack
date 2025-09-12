from pydantic import BaseModel

class StudentBase(BaseModel):
    name: str
    class_name: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int

    class Config:
        from_attributes=True