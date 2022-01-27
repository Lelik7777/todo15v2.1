import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import {AddBox} from '@mui/icons-material';
import {RequestStatusType} from '../../app/appReducer';
import {useSelector} from 'react-redux';
import {AppRootStateType} from '../../app/store';

type AddItemFormPropsType = {
    addItem: (title: string) => void;
    entityStatus?:RequestStatusType;
    idL?:string;
}

export const AddItemForm = React.memo(function (props: AddItemFormPropsType) {
    console.log('AddItemForm called')
    let [title, setTitle] = useState('')
    let [error, setError] = useState<string | null>(null)

    let status = useSelector<AppRootStateType,RequestStatusType|null>
    (state =>state.todolists.find(x=>x.id===props.idL)?.entityStatus??null);
    const addItem = () => {
        if (title.trim() !== '') {
            props.addItem(title);
            setTitle('');
        } else {
            setError('Title is required');
        }
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }

    const onKeyPressHandler = (e: KeyboardEvent<HTMLInputElement>) => {
        if (error !== null) {
            setError(null);
        }
        if (e.charCode === 13) {
            addItem();
        }
    }

    return <div>
        <TextField variant="outlined"
                   error={!!error}
                   value={title}
                   onChange={onChangeHandler}
                   onKeyPress={onKeyPressHandler}
                   label="Title"
                   helperText={error}
        />
        <IconButton color="primary" onClick={addItem} disabled={status==='loaded'}>
            <AddBox/>
        </IconButton>
    </div>
})
