import {
    combineReducers,
} from 'redux';

import * as data from '../modules/data';
import * as themes from '../modules/themes';
import * as view from '../modules/view';



const rootReducer = combineReducers({
    data: data.reducer,
    themes: themes.reducer,
    view: view.reducer,
});


export default rootReducer;
