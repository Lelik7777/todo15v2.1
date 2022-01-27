import {Dispatch} from 'redux';
import {ActionsAppType, setError, setStatusApp} from '../app/appReducer';
import {ResponseType} from '../api/todolists-api';

export const handleServerNetworkError = (e: { message: string }, dispatch: Dispatch<ActionsAppType>) => {
    dispatch(setError(e.message));
    dispatch(setStatusApp('failed'));
}
export const handlerErrorLengthText = <T>(data:ResponseType<T>,dispatch:Dispatch<ActionsAppType>) => {
    if (data.messages.length) {
        dispatch(setError(data.messages[0]));
    } else {
        dispatch(setError('some error occurred'))
    }
    dispatch(setStatusApp('failed'));
}