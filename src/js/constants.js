// Constants to represent each "page" of the app.
export const PAGE = {
    SERVER: "SERVER",
    LOGIN_TYPE: "LOGIN_TYPE",
    LOGIN: "LOGIN",
    SSO: "SSO",
    TOKEN_ENTRY: "TOKEN_ENTRY",
    USER: "USER",
    ADD: "ADD",
    PENDING: "PENDING",
    ADD_JOURNAL_ENTRY: "ADD_JOURNAL_ENTRY",
    ADD_IMAGE: "ADD_IMAGE",
};

// Backwards-compatibility, so I don't have to replace every
// instance of PAGE_URL right now...
export const PAGE_URL = PAGE;

/**
 * The rest of these are mostly actions to pass to StateStore
 */
export const STORAGE = {
    STATE_STORAGE_KEY: "MaharaMobile",
    AUTODETECTED_SERVER: "STORAGE_AUTODETECTED_SERVER",
    START_FETCH_USER_PROFILE_ICON: "START_FETCH_USER_PROFILE_ICON",
    STOP_AUTODETECTING: "STORAGE_STOP_DETECTING_PROTOCOL_AND_METHOD",
    SET_SERVER_URL: "STORAGE_SET_SERVER_URL",
    SET_USER_SYNC_DATA: "SET_USER_SYNC_DATA",
    SET_USER_PROFILE_ICON: "STORAGE_SET_USER_PROFILE_ICON",
    SET_MANUAL_TOKEN: "SET_MANUAL_TOKEN",
    STOP_VERIFYING_MANUAL_TOKEN: "STOP_VERIFYING_MANUAL_TOKEN",
    CLEAR_MANUAL_TOKEN: "CLEAR_MANUAL_TOKEN",
    SET_USER_LANGUAGE: "SET_USER_LANGUAGE",
    SET_DEFAULT_JOURNAL: "SET_DEFAULT_JOURNAL",
    SET_DEFAULT_FOLDER: "SET_DEFAULT_FOLDER",
    DEFAULT_LANGUAGE: 'en',
    DEFAULT_FOLDER: 'Mobile uploads'
};

export const JOURNAL = {
    TYPE: "JOURNAL_TYPE",
    ADD_ENTRY: "JOURNAL_ADD_ENTRY",
    EDIT_ENTRY: "EDIT_ENTRY",
    STARTED_EDITING_JOURNAL: "STARTED_EDITING_JOURNAL",
};

export const FILE_ENTRY = {
    TYPE: "FILE_ENTRY_TYPE",
    ADD_ENTRY: "FILE_ENTRY_ADD_ENTRY",
    EDIT_ENTRY: "FILE_ENTRY.EDIT_ENTRY",
};

export const PENDING = {
    DELETE_ALL: "PENDING_DELETE_ALL",
    DELETE: "PENDING_DELETE_BY_GUID",
    EDIT_JOURNAL: "EDIT_JOURNAL",
    EDIT_IMAGE: "EDIT_IMAGE",
    UPLOAD_NEXT: "PENDING_UPLOAD_NEXT",
    STARTED_UPLOAD_AT: "PENDING_STARTED_UPLOAD_AT",
    STOP_UPLOADS: "PENDING_STOP_UPLOADS",
    UPLOAD_ITEM_FINISHED: "UPLOAD_ITEM_FINISHED"
};

export const LOGIN_TYPE = {
    LOCAL: "LOGIN_LOCAL", //NOTE: the value must be identical values to constants of maraha-lib/constants.js too
    SINGLE_SIGN_ON: "LOGIN_SINGLE_SIGN_ON", //NOTE: the value must be identical values to constants of maraha-lib/constants.js too
    MANUAL_TOKEN: "LOGIN_MANUAL_TOKEN", //NOTE: the value must be identical values to constants of maraha-lib/constants.js too
};

export const LOGIN = {
    AFTER_LOGIN_GET_PROFILE: "LOGIN_AFTER_LOGIN_GET_PROFILE",
    STOP_GETTING_PROFILE: "LOGIN_STOP_GETTING_PROFILE",
    START_GET_USER_ICON: "LOGIN_START_GET_USER_ICON",
    STOP_GET_USER_ICON: "LOGIN_STOP_GET_USER_ICON",
    LOGOUT: "LOGOUT"
};

export const REATTEMPT_UPLOADS_AFTER_MILLISECONDS = 100; //5 * 60 * 1000;
