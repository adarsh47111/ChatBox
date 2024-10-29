import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/app";
import authReducer from "./slices/auth";
import conversationsReducer from "./slices/conversation";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import persistStore from "redux-persist/es/persistStore";


const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  conversations: conversationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

export default store;
