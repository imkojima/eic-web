"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = SlideshowSideBar;
var _reactImage = _interopRequireDefault(require("@readr-media/react-image"));
var _react = _interopRequireDefault(require("react"));
var _styledComponents = _interopRequireWildcard(require("styled-components"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Root-relative path served by the consuming app's /public directory — see
// image-block.tsx for why the bundled asset import 404s in production.
var defaultImage = '/post-default.png';
var arrowShareStyle = (0, _styledComponents.css)(["width:64px;height:64px;margin:auto;cursor:pointer;border-radius:50%;visibility:", ";position:relative;&:hover{background-color:rgba(255,255,255,0.2);}&::before{content:'';position:absolute;top:50%;left:50%;width:12px;height:12px;border-left:2px solid #ffffff;border-bottom:2px solid #ffffff;}"], function (props) {
  return props.shouldHideArrow ? 'hidden' : 'visible';
});
var SideBarWrapper = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-sidebar__SideBarWrapper",
  componentId: "sc-gs6lwe-0"
})(["width:64px;position:relative;.sidebar-images{overflow-y:scroll;max-height:520px;scrollbar-width:none;margin:12px auto;&::-webkit-scrollbar{display:none;}}"]);
var ArrowUp = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-sidebar__ArrowUp",
  componentId: "sc-gs6lwe-1"
})(["", " &::before{transform:translate(-50%,-25%) rotate(135deg);}"], arrowShareStyle);
var ArrowDown = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-sidebar__ArrowDown",
  componentId: "sc-gs6lwe-2"
})(["", " &::before{transform:translate(-50%,-75%) rotate(-45deg);}"], arrowShareStyle);
var SideBarImage = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-sidebar__SideBarImage",
  componentId: "sc-gs6lwe-3"
})(["width:100%;aspect-ratio:1/1;cursor:pointer;filter:", ";&:hover{filter:", ";}& + *{margin-top:12px;}"], function (props) {
  return props.isfocused ? 'none' : 'brightness(35%)';
}, function (props) {
  return props.isfocused ? 'none' : 'brightness(60%)';
});
function SlideshowSideBar(_ref) {
  var focusImageIndex = _ref.focusImageIndex,
    images = _ref.images,
    setFocusImageIndex = _ref.setFocusImageIndex,
    imagesRefs = _ref.imagesRefs;
  var handleScrollUp = function handleScrollUp() {
    if (focusImageIndex > 0) {
      var _imagesRefs$current;
      setFocusImageIndex(focusImageIndex - 1);
      imagesRefs === null || imagesRefs === void 0 || (_imagesRefs$current = imagesRefs.current[focusImageIndex - 1]) === null || _imagesRefs$current === void 0 || _imagesRefs$current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
  var handleScrollDown = function handleScrollDown() {
    if (focusImageIndex < (images === null || images === void 0 ? void 0 : images.length) - 1) {
      var _imagesRefs$current2;
      setFocusImageIndex(focusImageIndex + 1);
      imagesRefs === null || imagesRefs === void 0 || (_imagesRefs$current2 = imagesRefs.current[focusImageIndex + 1]) === null || _imagesRefs$current2 === void 0 || _imagesRefs$current2.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
  var handleScrollIntoView = function handleScrollIntoView(index) {
    var _imagesRefs$current$i;
    setFocusImageIndex(index);
    imagesRefs === null || imagesRefs === void 0 || (_imagesRefs$current$i = imagesRefs.current[index]) === null || _imagesRefs$current$i === void 0 || _imagesRefs$current$i.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };
  var sideBarImages = images.map(function (image, index) {
    return /*#__PURE__*/_react["default"].createElement(SideBarImage, {
      key: image === null || image === void 0 ? void 0 : image.id,
      isfocused: focusImageIndex === index,
      onClick: function onClick() {
        handleScrollIntoView(index);
      },
      ref: function ref(el) {
        if (imagesRefs !== null && imagesRefs !== void 0 && imagesRefs.current) {
          imagesRefs.current[index] = el;
        }
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactImage["default"], {
      images: image === null || image === void 0 ? void 0 : image.resized,
      defaultImage: defaultImage,
      alt: image === null || image === void 0 ? void 0 : image.name,
      rwd: {
        desktop: '64px',
        "default": '100%'
      },
      priority: true
    }));
  });
  return /*#__PURE__*/_react["default"].createElement(SideBarWrapper, null, /*#__PURE__*/_react["default"].createElement(ArrowUp, {
    onClick: handleScrollUp,
    shouldHideArrow: focusImageIndex === 0
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "sidebar-images"
  }, sideBarImages), /*#__PURE__*/_react["default"].createElement(ArrowDown, {
    onClick: handleScrollDown,
    shouldHideArrow: focusImageIndex + 1 === (images === null || images === void 0 ? void 0 : images.length)
  }));
}