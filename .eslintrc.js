module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "globals": {
        "Buffer": true,
        "__dirname": true,
        "require": true,
        "angular": true,
        "Rx": true,
        "describe": true,
        "it": true,
        "module": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};