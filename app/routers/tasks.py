from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix='/tasks', tags=['Tasks'])

@router.get('/', response_model=list[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db),
              current_user = Depends(auth.get_current_user)):
    return db.query(models.Task).filter(
        models.Task.owner_id == current_user.id).all()

@router.post('/', response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db),
                current_user = Depends(auth.get_current_user)):
    new_task = models.Task(title=task.title, owner_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.patch('/{task_id}/complete', response_model=schemas.TaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db),
                  current_user = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id).first()
    if not task: raise HTTPException(status_code=404, detail='Task not found')
    task.completed = True
    db.commit()
    db.refresh(task)
    return task

@router.delete('/{task_id}', status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db),
                current_user = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id).first()
    if not task: raise HTTPException(status_code=404, detail='Task not found')
    db.delete(task)
    db.commit()
