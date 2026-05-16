"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SlideshowBlock = SlideshowBlock;
exports.SlideshowBlockV2 = SlideshowBlockV2;
var _reactImage = _interopRequireDefault(require("@readr-media/react-image"));
var _react = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _slideshowLightbox = _interopRequireDefault(require("../components/slideshow-lightbox"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var defaultImage = "/lib/public/57b35d645151e45c1816907625905202.png";
var SlideShowDesktopSize = 960;
var SpacingBetweenSlideImages = 12;
var SlideShowRowHeight = 300;
var DefaultMaxImagesPerRow = 3;
var SlideShowBlockWrapper = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-block__SlideShowBlockWrapper",
  componentId: "sc-gsubhh-0"
})(["width:calc(100% + 36px);position:relative;background-color:", ";margin:32px -18px 0;padding:18px 28px;", "{width:", ";", " background-color:transparent;padding:0;display:flex;flex-direction:column;gap:", "px;max-height:", ";overflow:", ";margin-bottom:", ";}"], function (_ref) {
  var theme = _ref.theme;
  return theme.colors.grayscale[95];
}, function (_ref2) {
  var theme = _ref2.theme;
  return theme.breakpoint.xl;
}, function (props) {
  return props.widthPercentage ? "".concat(props.widthPercentage, "%") : '100%';
}, function (props) {
  return props.widthPercentage ? 'margin-left: auto; margin-right: auto;' : '';
}, SpacingBetweenSlideImages, function (props) {
  return props.expandSlideShow ? 'none' : '960px';
}, function (props) {
  return props.expandSlideShow ? 'visible' : 'hidden';
}, function (props) {
  return props.expandSlideShow ? '32px' : '16px';
});
var SlideShowRow = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-block__SlideShowRow",
  componentId: "sc-gsubhh-1"
})(["display:contents;", "{display:flex;align-items:stretch;gap:", "px;}"], function (_ref3) {
  var theme = _ref3.theme;
  return theme.breakpoint.xl;
}, SpacingBetweenSlideImages);
var SlideShowImage = _styledComponents["default"].figure.withConfig({
  displayName: "slideshow-block__SlideShowImage",
  componentId: "sc-gsubhh-2"
})(["width:100%;aspect-ratio:", ";margin:0;& + .slideshow-image{margin-top:", "px;}", "{aspect-ratio:unset;max-height:", ";flex-grow:", ";flex-shrink:", ";flex-basis:", ";overflow:", ";", " img{width:", ";max-width:100%;height:", ";object-fit:contain;}&:hover{cursor:", ";filter:", ";transition:", ";}& + .slideshow-image{margin-top:unset;}}"], function (props) {
  return props.isSingle ? 'unset' : '4/3';
}, SpacingBetweenSlideImages, function (_ref4) {
  var theme = _ref4.theme;
  return theme.breakpoint.xl;
}, function (props) {
  return props.isSingle ? 'none' : "".concat(SlideShowRowHeight, "px");
}, function (props) {
  return props.isSingle ? 0 : props.aspectRatio || 1;
}, function (props) {
  return props.isSingle ? 0 : 1;
}, function (props) {
  return props.isSingle ? 'auto' : "".concat(Math.round((props.aspectRatio || 1) * SlideShowRowHeight), "px");
}, function (props) {
  return props.isSingle ? 'visible' : 'hidden';
}, function (props) {
  return props.isSingle ? 'margin: 0 auto;' : '';
}, function (props) {
  return props.isSingle ? 'auto' : '100%';
}, function (props) {
  return props.isSingle ? 'auto' : '100%';
}, function (props) {
  return props.lightboxEnabled ? 'pointer' : 'default';
}, function (props) {
  return props.lightboxEnabled ? 'brightness(0.85)' : 'none';
}, function (props) {
  return props.lightboxEnabled ? '0.3s' : 'none';
});
var FigCaption = _styledComponents["default"].figcaption.withConfig({
  displayName: "slideshow-block__FigCaption",
  componentId: "sc-gsubhh-3"
})(["font-weight:400;line-height:23px;color:#000928;opacity:0.5;", ";padding:8px 20px 12px 20px;text-align:center;", "{", ";text-align:left;}", "{display:none;}"], function (_ref5) {
  var theme = _ref5.theme;
  return theme.fontSize.xs;
}, function (_ref6) {
  var theme = _ref6.theme;
  return theme.breakpoint.md;
}, function (_ref7) {
  var theme = _ref7.theme;
  return theme.fontSize.sm;
}, function (_ref8) {
  var theme = _ref8.theme;
  return theme.breakpoint.xl;
});
var GradientMask = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-block__GradientMask",
  componentId: "sc-gsubhh-4"
})(["display:none;", "{cursor:pointer;display:block;position:absolute;width:100%;height:", "px;bottom:0;left:0;background:linear-gradient( to bottom,rgba(255,255,255,0) 648px,rgba(255,255,255,1) 960px );}"], function (_ref9) {
  var theme = _ref9.theme;
  return theme.breakpoint.xl;
}, SlideShowDesktopSize);
var ExpandText = _styledComponents["default"].div.withConfig({
  displayName: "slideshow-block__ExpandText",
  componentId: "sc-gsubhh-5"
})(["display:none;", "{display:block;font-style:normal;font-weight:700;", ";line-height:18px;letter-spacing:0.03em;color:#000928;text-align:center;cursor:pointer;position:relative;margin-bottom:48px;transition:all 0.2s ease;&:hover::after,&:active::after{bottom:-30px;transition:all 0.2s;}&::after{content:'\u25BC';position:absolute;bottom:-26px;left:50%;transform:translate(-50%,0%);font-size:12px;color:#000928;}}"], function (_ref0) {
  var theme = _ref0.theme;
  return theme.breakpoint.xl;
}, function (_ref1) {
  var theme = _ref1.theme;
  return theme.fontSize.md;
});
var OverallCaption = _styledComponents["default"].figcaption.withConfig({
  displayName: "slideshow-block__OverallCaption",
  componentId: "sc-gsubhh-6"
})(["font-weight:400;line-height:1.6;color:#000928;opacity:0.5;", ";padding:8px 20px 20px 20px;text-align:center;", "{", ";text-align:left;padding:8px 0 20px 0;}", "{", ";text-align:left;padding:8px 0 20px 0;}"], function (_ref10) {
  var theme = _ref10.theme;
  return theme.fontSize.xs;
}, function (_ref11) {
  var theme = _ref11.theme;
  return theme.breakpoint.md;
}, function (_ref12) {
  var theme = _ref12.theme;
  return theme.fontSize.sm;
}, function (_ref13) {
  var theme = _ref13.theme;
  return theme.breakpoint.xl;
}, function (_ref14) {
  var theme = _ref14.theme;
  return theme.fontSize.sm;
});

// support old version of slideshow without delay propertiy
var Figure = _styledComponents["default"].figure.withConfig({
  displayName: "slideshow-block__Figure",
  componentId: "sc-gsubhh-7"
})(["position:relative;margin-block:unset;margin-inline:unset;margin:0 10px;"]);
var Image = _styledComponents["default"].img.withConfig({
  displayName: "slideshow-block__Image",
  componentId: "sc-gsubhh-8"
})(["width:100%;"]);
function SlideshowBlock(entity) {
  var _images$, _images$2;
  var images = entity.getData();
  return /*#__PURE__*/_react["default"].createElement(Figure, null, /*#__PURE__*/_react["default"].createElement(Image, {
    src: images === null || images === void 0 || (_images$ = images[0]) === null || _images$ === void 0 || (_images$ = _images$.resized) === null || _images$ === void 0 ? void 0 : _images$.original,
    alt: images === null || images === void 0 || (_images$2 = images[0]) === null || _images$2 === void 0 ? void 0 : _images$2.name,
    onError: function onError(e) {
      var _images$3;
      return e.currentTarget.src = images === null || images === void 0 || (_images$3 = images[0]) === null || _images$3 === void 0 || (_images$3 = _images$3.imageFile) === null || _images$3 === void 0 ? void 0 : _images$3.url;
    }
  }));
}

// 202206 latest version of slideshow, support delay property
function SlideshowBlockV2(entity) {
  var _entity$getData = entity.getData(),
    images = _entity$getData.images,
    overallCaption = _entity$getData.overallCaption,
    widthPercentage = _entity$getData.widthPercentage,
    maxImagesPerRow = _entity$getData.maxImagesPerRow,
    _entity$getData$light = _entity$getData.lightboxEnabled,
    lightboxEnabled = _entity$getData$light === void 0 ? true : _entity$getData$light;
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    expandSlideShow = _useState2[0],
    setExpandSlideShow = _useState2[1];
  var _useState3 = (0, _react.useState)(false),
    _useState4 = _slicedToArray(_useState3, 2),
    showLightBox = _useState4[0],
    setShowLightBox = _useState4[1];
  var _useState5 = (0, _react.useState)(0),
    _useState6 = _slicedToArray(_useState5, 2),
    focusImageIndex = _useState6[0],
    setFocusImageIndex = _useState6[1];
  var _useState7 = (0, _react.useState)({}),
    _useState8 = _slicedToArray(_useState7, 2),
    aspectRatios = _useState8[0],
    setAspectRatios = _useState8[1];
  var imagesRefs = (0, _react.useRef)(Array(images.length).fill(null));
  (0, _react.useEffect)(function () {
    var focusedImageRef = imagesRefs === null || imagesRefs === void 0 ? void 0 : imagesRefs.current[focusImageIndex];
    if (focusedImageRef) {
      focusedImageRef === null || focusedImageRef === void 0 || focusedImageRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [focusImageIndex]);

  // Load images to get natural dimensions for justified layout
  (0, _react.useEffect)(function () {
    images.forEach(function (image) {
      var _image$resized, _image$resized2, _image$imageFile;
      var src = ((_image$resized = image.resized) === null || _image$resized === void 0 ? void 0 : _image$resized.original) || ((_image$resized2 = image.resized) === null || _image$resized2 === void 0 ? void 0 : _image$resized2.w800) || ((_image$imageFile = image.imageFile) === null || _image$imageFile === void 0 ? void 0 : _image$imageFile.url);
      if (!src) return;
      var img = new window.Image();
      img.onload = function () {
        setAspectRatios(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, image.id, img.naturalWidth / img.naturalHeight));
        });
      };
      img.src = src;
    });
  }, [images]);
  var shouldMaskSlideShow = Boolean(images.length > 9 && !expandSlideShow);
  var renderImage = function renderImage(image, index) {
    var id = image.id,
      resized = image.resized,
      desc = image.desc,
      name = image.name;
    var ratio = aspectRatios[id] || 1;
    return /*#__PURE__*/_react["default"].createElement(SlideShowImage, {
      className: "slideshow-image",
      key: id,
      aspectRatio: ratio,
      isSingle: images.length === 1,
      lightboxEnabled: lightboxEnabled,
      onClick: function onClick() {
        if (!lightboxEnabled) return;
        setShowLightBox(!showLightBox);
        setFocusImageIndex(index);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactImage["default"], {
      images: resized,
      defaultImage: defaultImage,
      alt: name,
      rwd: {
        mobile: '100vw',
        tablet: '608px',
        desktop: '960px',
        "default": '100%'
      },
      priority: true
    }), desc && /*#__PURE__*/_react["default"].createElement(FigCaption, null, desc));
  };

  // Split images into rows based on maxImagesPerRow
  var perRow = maxImagesPerRow || DefaultMaxImagesPerRow;
  var rows = [];
  for (var i = 0; i < images.length; i += perRow) {
    rows.push(images.slice(i, i + perRow));
  }
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(SlideShowBlockWrapper, {
    onClick: shouldMaskSlideShow ? function () {
      return setExpandSlideShow(!expandSlideShow);
    } : undefined,
    expandSlideShow: expandSlideShow,
    widthPercentage: widthPercentage
  }, rows.map(function (rowImages, rowIndex) {
    return /*#__PURE__*/_react["default"].createElement(SlideShowRow, {
      key: rowIndex
    }, rowImages.map(function (image, imgIndex) {
      return renderImage(image, rowIndex * perRow + imgIndex);
    }));
  }), shouldMaskSlideShow && /*#__PURE__*/_react["default"].createElement(GradientMask, null)), shouldMaskSlideShow && /*#__PURE__*/_react["default"].createElement(ExpandText, {
    className: "slideshow-expand-text",
    onClick: function onClick() {
      return setExpandSlideShow(!expandSlideShow);
    }
  }, "\u5C55\u958B\u6240\u6709\u5716\u7247"), overallCaption && /*#__PURE__*/_react["default"].createElement(OverallCaption, null, overallCaption), showLightBox && lightboxEnabled && /*#__PURE__*/_react["default"].createElement(_slideshowLightbox["default"], {
    focusImageIndex: focusImageIndex,
    images: images,
    setShowLightBox: setShowLightBox,
    setFocusImageIndex: setFocusImageIndex,
    imagesRefs: imagesRefs
  }));
}