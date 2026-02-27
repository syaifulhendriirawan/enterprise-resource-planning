from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None
    role: Optional[str] = "staff"

class UserCreate(UserBase):
    username: str
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None
    username: str
    created_at: datetime
    
    model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    password_hash: str
