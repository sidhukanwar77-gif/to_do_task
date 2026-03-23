from pydantic import BaseModel, field_validator

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator('password')
    @classmethod
    def password_max_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be 72 characters or less')
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    class Config: from_attributes = True

class TaskCreate(BaseModel):
    title: str

class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
