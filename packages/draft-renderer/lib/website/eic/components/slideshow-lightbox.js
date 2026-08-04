"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = SlideshowLightBox;
var _reactImage = _interopRequireDefault(require("@readr-media/react-image"));
var _react = _interopRequireDefault(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _slideshowSidebar = _interopRequireDefault(require("./slideshow-sidebar"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Root-relative path served by the consuming app's /public directory — see
// image-block.tsx for why the bundled asset import 404s in production.
var defaultImage = '/post-default.png';
var LightBoxWrapper = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-lightbox__LightBoxWrapper",
  componentId: "sc-rdebmr-0"
})(["display:none;", "{background:rgba(36,36,36,0.7);width:100%;height:100vh;position:fixed;top:0;left:0;color:white;padding:0 72px 0 48px;display:flex;align-items:center;justify-content:space-between;z-index:9999;}"], function (_ref) {
  var theme = _ref.theme;
  return theme.breakpoint.xl;
});
var FocusImageWrapper = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-lightbox__FocusImageWrapper",
  componentId: "sc-rdebmr-1"
})(["font-weight:400;", ";line-height:23px;text-align:center;color:#ffffff;"], function (_ref2) {
  var theme = _ref2.theme;
  return theme.fontSize.sm;
});
var FocusImage = _styledComponents["default"].figure.withConfig({
  displayName: "slideshow-lightbox__FocusImage",
  componentId: "sc-rdebmr-2"
})(["max-width:900px;max-height:60vh;margin-bottom:32px;display:flex;align-items:center;justify-content:center;img{max-width:100%;max-height:60vh;object-fit:contain;}", "{max-width:960px;}"], function (_ref3) {
  var theme = _ref3.theme;
  return theme.breakpoint.xxl;
});
var FocusInfo = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-lightbox__FocusInfo",
  componentId: "sc-rdebmr-3"
})([".focus-desc{max-height:46px;overflow:hidden;word-break:break-word;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;opacity:0.87;margin-bottom:12px;text-align:left;}.focus-number{opacity:0.5;margin-top:12px;}"]);
var CloseButtonWrapper = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-lightbox__CloseButtonWrapper",
  componentId: "sc-rdebmr-4"
})(["height:60vh;width:64px;position:relative;"]);
var CloseButton = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-lightbox__CloseButton",
  componentId: "sc-rdebmr-5"
})(["width:64px;height:64px;margin:auto;cursor:pointer;position:absolute;top:-64px;border-radius:50%;&:hover{background-color:rgba(255,255,255,0.2);}&::before,&::after{content:'';position:absolute;top:50%;left:50%;width:24px;height:2px;background-color:#ffffff;}&::before{transform:translate(-50%,-50%) rotate(45deg);}&::after{transform:translate(-50%,-50%) rotate(-45deg);}"]);
function SlideshowLightBox(_ref4) {
  var focusImageIndex = _ref4.focusImageIndex,
    images = _ref4.images,
    setShowLightBox = _ref4.setShowLightBox,
    setFocusImageIndex = _ref4.setFocusImageIndex,
    imagesRefs = _ref4.imagesRefs;
  var focusImageDesc = "".concat(images[focusImageIndex].desc);
  var focusNumber = "".concat(focusImageIndex + 1, " / ").concat(images === null || images === void 0 ? void 0 : images.length);
  return /*#__PURE__*/_react["default"].createElement(LightBoxWrapper, null, /*#__PURE__*/_react["default"].createElement(_slideshowSidebar["default"], {
    focusImageIndex: focusImageIndex,
    images: images,
    setFocusImageIndex: setFocusImageIndex,
    imagesRefs: imagesRefs
  }), /*#__PURE__*/_react["default"].createElement(FocusImageWrapper, null, /*#__PURE__*/_react["default"].createElement(FocusImage, null, /*#__PURE__*/_react["default"].createElement(_reactImage["default"], {
    images: images[focusImageIndex].resized,
    defaultImage: defaultImage,
    alt: images[focusImageIndex].name,
    objectFit: 'contain',
    rwd: {
      desktop: '960px',
      "default": '100%'
    },
    priority: true
  })), /*#__PURE__*/_react["default"].createElement(FocusInfo, null, /*#__PURE__*/_react["default"].createElement("p", {
    className: "focus-desc"
  }, focusImageDesc), /*#__PURE__*/_react["default"].createElement("p", {
    className: "focus-number"
  }, focusNumber))), /*#__PURE__*/_react["default"].createElement(CloseButtonWrapper, null, /*#__PURE__*/_react["default"].createElement(CloseButton, {
    onClick: function onClick(e) {
      e.preventDefault();
      setShowLightBox(false);
    }
  })));
}