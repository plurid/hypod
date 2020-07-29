import {
    combineReducers,
} from 'redux';

import * as data from '../modules/data';
import * as themes from '../modules/themes';



const rootReducer = combineReducers({
    data: data.reducer,
    themes: themes.reducer,
});


export default rootReducer;
