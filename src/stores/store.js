import {configureStore} from '@reduxjs/toolkit';   
import userReducer from './userSlice';

const store = configureStore({
    reducer: {
        user: userReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore socket connection and specific actions
                ignoredActions: [
                    'user/setSocketConnection',
                    'user/setOnlineUser'
                ],
                // Ignore socket in state
                ignoredPaths: [
                    'user.socketConnection'
                ],
            },
        }),
});

export default store;