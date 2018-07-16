exports.ids = [1];
exports.modules = {

/***/ "./src/components/Link.tsx":
/*!*********************************!*\
  !*** ./src/components/Link.tsx ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


const pushState = (url) => (e) => {
    e.preventDefault();
    history.pushState(null, "", url);
};
const Link = (_a) => {
    var { href } = _a, rest = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["href"]);
    return react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("a", Object.assign({ href: href, onClick: pushState(href) }, rest));
};
/* harmony default export */ __webpack_exports__["default"] = (Link);


/***/ }),

/***/ "./src/components/Users.tsx":
/*!**********************************!*\
  !*** ./src/components/Users.tsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var mobx_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mobx-react */ "./node_modules/mobx-react/index.module.js");
/* harmony import */ var _Link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Link */ "./src/components/Link.tsx");




let Users = class Users extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    render() {
        const { id, appState } = this.props;
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", null,
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", null, "Users"),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("ul", null,
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("li", null,
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_Link__WEBPACK_IMPORTED_MODULE_3__["default"], { href: "/users/1" }, "1")),
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("li", null,
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_Link__WEBPACK_IMPORTED_MODULE_3__["default"], { href: "/users/2" }, "2")),
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("li", null,
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_Link__WEBPACK_IMPORTED_MODULE_3__["default"], { href: "/users/3" }, "3"))),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", null,
                "route params: ",
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("code", null, JSON.stringify({ id }, null, 4))),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", null,
                "message: ",
                appState.message)));
    }
};
Users = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    mobx_react__WEBPACK_IMPORTED_MODULE_2__["observer"]
], Users);
/* harmony default export */ __webpack_exports__["default"] = (Users);


/***/ })

};;
//# sourceMappingURL=1.ad73b2e6e7bcbcc2ee2b.map.js