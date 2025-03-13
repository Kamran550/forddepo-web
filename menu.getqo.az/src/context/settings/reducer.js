import {RESET, SET_ADDRESS, SET_LOCATION, SET_LOCATION_ID, UPDATE} from "./actions.js";

export default function settings_reducer(state, action) {
    const {type, payload} = action;
    switch (type) {
        case UPDATE:
            return {
                ...state,
                ...payload,
            };
        case RESET:
            return {location: state.location};
        case SET_LOCATION:
            return {
                ...state,
                location: payload,
            };
        case SET_ADDRESS:
            return {
                ...state,
                address: payload,
            };
        case SET_LOCATION_ID:
            return {
                ...state,
                location_id: payload,
            };
        default:
            return state;
    }
}