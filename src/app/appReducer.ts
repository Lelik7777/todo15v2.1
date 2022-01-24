const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as null|string,
};

export const appReducer = (state: InitialStateType = initialState, action: ActionsAppType): InitialStateType => {
    switch (action.type) {
        case 'APP_SET_STATUS':
            debugger
            return {...state, status: action.status};
        case 'APP_SET_ERROR':
            return {...state, error: action.error};
        default:
            return state;
    }
}

export const setStatusApp = (status: RequestStatusType) => ({type: 'APP_SET_STATUS', status} as const);
export const setError = (error: string|null) => ({type: 'APP_SET_ERROR', error} as const);
export type RequestStatusType = 'idle' | 'successful' | 'failed' | 'loaded';
type InitialStateType = typeof initialState;
export type ActionsAppType = ReturnType<typeof setStatusApp> | ReturnType<typeof setError>