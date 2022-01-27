import {ResponseResultCode, todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setError, setStatusApp} from '../../app/appReducer';
import {AppRootStateType, CommonActionType} from '../../app/store';
import {handlerErrorLengthText, handleServerNetworkError} from '../../utilities/error-utilies';

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsTodoListsType)
    : Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}));
        case 'TODOLIST/SET_ENTITY_STATUS':
            return state.map(x => x.id === action.idL ? {...x, entityStatus: action.status} : x);
        default:
            return state
    }
}

// actions
export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const);
export const setEntityStatusForList = (idL: string, status: RequestStatusType) =>
    ({type: 'TODOLIST/SET_ENTITY_STATUS', idL, status} as const);

// thunks
export const fetchTodolistsTC = () =>
    async (dispatch: Dispatch<CommonActionType>) => {
        dispatch(setStatusApp('loaded'));
        const res = await todolistsAPI.getTodolists();
        try {
            dispatch(setTodolistsAC(res.data));
            dispatch(setStatusApp('successful'));
        } catch (e: any) {
            handleServerNetworkError(e, dispatch);
        } finally {

        }

    }

export const removeTodolistTC = (todolistId: string) =>
    async (dispatch: Dispatch<CommonActionType>) => {

        dispatch(setStatusApp('loaded'));
        dispatch(setEntityStatusForList(todolistId, 'loaded'))
        const res = await todolistsAPI.deleteTodolist(todolistId);
        try {
            if (res.data.resultCode === ResponseResultCode.success) {
                dispatch(removeTodolistAC(todolistId));
                dispatch(setStatusApp('successful'));
            }

        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
        }
    }
export const addTodolistTC = (title: string) =>
    async (dispatch: Dispatch<CommonActionType>, getState: () => AppRootStateType) => {
        dispatch(setStatusApp('loaded'));
        const res = await todolistsAPI.createTodolist(title);
        try {
            if (res.data.resultCode === ResponseResultCode.success) {
                dispatch(addTodolistAC(res.data.data.item));
            } else {
              handlerErrorLengthText(res.data,dispatch);
            }

        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
        } finally {
            if (!(getState().app.status === 'failed')) {
                dispatch(setStatusApp('successful'));
            }

        }
    }

export const changeTodolistTitleTC = (id: string, title: string) =>
    async (dispatch: Dispatch<CommonActionType>) => {
        dispatch(setStatusApp('loaded'));
        const res = await todolistsAPI.updateTodolist(id, title);
        try {
            if (res.data.resultCode == ResponseResultCode.success) {
                dispatch(changeTodolistTitleAC(id, title));
                dispatch(setStatusApp('successful'));
            }
        } catch (e: any) {
            handleServerNetworkError(e, dispatch);
        }
    }

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ActionsTodoListsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | ReturnType<typeof setEntityStatusForList>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
}
