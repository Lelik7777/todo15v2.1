import {
    AddTodolistActionType,
    RemoveTodolistActionType,
    setEntityStatusForList,
    SetTodolistsActionType
} from './todolists-reducer'
import {
    ResponseResultCode,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType, CommonActionType} from '../../app/store'
import {setError, setStatusApp} from '../../app/appReducer';
import {handlerErrorLengthText, handleServerNetworkError} from '../../utilities/error-utilies';

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsTasksType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case 'ADD-TODOLIST':
            return {...state, [action.todolist.id]: []}
        case 'REMOVE-TODOLIST':
            const copyState = {...state}
            delete copyState[action.id]
            return copyState
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':
            return {...state, [action.todolistId]: action.tasks}
        default:
            return state
    }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string) =>
    async (dispatch: Dispatch<CommonActionType>) => {
        try {
            dispatch(setStatusApp('loaded'));
            const res = await todolistsAPI.getTasks(todolistId);
            dispatch(setTasksAC(res.data.items, todolistId));
            dispatch(setStatusApp('successful'));
        } catch (e: any) {
            handleServerNetworkError(e, dispatch);
        }
    }
export const removeTaskTC = (taskId: string, todolistId: string) =>
    async (dispatch: Dispatch<CommonActionType>) => {
        try {
            dispatch(setStatusApp('loaded'));
            dispatch(setEntityStatusForList(todolistId, 'loaded'));
            const res = await todolistsAPI.deleteTask(todolistId, taskId);
            if (res.data.resultCode === ResponseResultCode.success) {
                dispatch(removeTaskAC(taskId, todolistId));
                dispatch(setStatusApp('successful'));
                dispatch(setEntityStatusForList(todolistId, 'successful'));
            }
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
        }
    }
export const addTaskTC = (title: string, todolistId: string) =>
    async (dispatch: Dispatch<CommonActionType>) => {
        try {
            dispatch(setStatusApp('loaded'));
            dispatch(setEntityStatusForList(todolistId, 'loaded'));

            const res = await todolistsAPI.createTask(todolistId, title);
            if (res.data.resultCode === ResponseResultCode.success) {
                dispatch(addTaskAC(res.data.data.item));
                dispatch(setEntityStatusForList(todolistId, 'successful'));
            } else {
                handlerErrorLengthText(res.data, dispatch);
            }

        } catch (e: any) {
            handleServerNetworkError(e, dispatch);
        } finally {
            dispatch(setStatusApp('successful'));
        }

    }
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    async (dispatch: Dispatch<CommonActionType>, getState: () => AppRootStateType) => {
        debugger
        try {
            debugger
            const task = getState().tasks[todolistId].find(t => t.id === taskId)
            if (!task) {
                //throw new Error("task not found in the state");
                console.warn('task not found in the state')
                return
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...domainModel
            }


            dispatch(setStatusApp('loaded'));
            const res = await todolistsAPI.updateTask(todolistId, taskId, apiModel);
            if (res.data.resultCode === ResponseResultCode.success) {
                dispatch(updateTaskAC(taskId, domainModel, todolistId));
                dispatch(setStatusApp('successful'));
            } else {
                throw new Error('error');
            }
        } catch (e: any) {
            handleServerNetworkError(e, dispatch);
        }
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
export type ActionsTasksType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>
