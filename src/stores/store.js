import {configureStore} from '@reduxjs/toolkit';   
import userReducer from './userSlice';

const store = configureStore({
    reducer: {
        user: userReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['user/setSocketConnection'],
                ignoredPaths: ['user.socketConnection'],
            },
        }),
});

export default store;