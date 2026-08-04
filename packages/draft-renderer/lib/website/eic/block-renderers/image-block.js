"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageBlock = ImageBlock;
var _react = _interopRequireDefault(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _reactImage = _interopRequireDefault(require("@readr-media/react-image"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Root-relative path served by the consuming app's /public directory.
// The babel file-loader asset import previously used here bakes in a build-time
// path (dev: `/lib/public/[hash].png`, prod: an unpkg URL) that isn't reachable
// from the consuming app's origin, so the fallback 404s exactly when it's needed.
var defaultImage = '/post-default.png';
var Figure = _styledComponents["default"].figure.withConfig({
  displayName: "image-block__Figure",
  componentId: "sc-1v0uv2e-0"
})(["width:100%;", ";"], function (_ref) {
  var theme = _ref.theme;
  return theme.margin["default"];
});
var FigureCaption = _styledComponents["default"].figcaption.withConfig({
  displayName: "image-block__FigureCaption",
  componentId: "sc-1v0uv2e-1"
})(["width:100%;font-size:12px;line-height:1.25;text-align:justify;color:#373740;padding:0;margin:8px 0 0;", "{line-height:1.25;}"], function (_ref2) {
  var theme = _ref2.theme;
  return theme.breakpoint.xl;
});
var CaptionLink = _styledComponents["default"].a.withConfig({
  displayName: "image-block__CaptionLink",
  componentId: "sc-1v0uv2e-2"
})(["color:", ";text-decoration:underline;&:hover{color:", ";}"], function (_ref3) {
  var theme = _ref3.theme;
  return theme.colors.primary[20];
}, function (_ref4) {
  var theme = _ref4.theme;
  return theme.colors.primary[0];
});
function renderCaptionBlock(block, entityMap) {
  var _block$text, _block$entityRanges;
  var text = (_block$text = block.text) !== null && _block$text !== void 0 ? _block$text : '';
  var ranges = ((_block$entityRanges = block.entityRanges) !== null && _block$entityRanges !== void 0 ? _block$entityRanges : []).slice().sort(function (a, b) {
    return a.offset - b.offset;
  });
  if (!ranges.length) return text;
  var segments = [];
  var cursor = 0;
  ranges.forEach(function (range, i) {
    var _entity$data;
    if (range.offset > cursor) {
      segments.push(text.slice(cursor, range.offset));
    }
    var entity = entityMap[range.key];
    var slice = text.slice(range.offset, range.offset + range.length);
    if ((entity === null || entity === void 0 ? void 0 : entity.type) === 'LINK' && (_entity$data = entity.data) !== null && _entity$data !== void 0 && _entity$data.url) {
      var _block$key;
      segments.push(/*#__PURE__*/_react["default"].createElement(CaptionLink, {
        key: "".concat((_block$key = block.key) !== null && _block$key !== void 0 ? _block$key : 'b', "-").concat(i),
        href: entity.data.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, slice));
    } else {
      segments.push(slice);
    }
    cursor = range.offset + range.length;
  });
  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, segments);
}
function CaptionRichText(_ref5) {
  var _raw$blocks, _raw$entityMap;
  var raw = _ref5.raw;
  var blocks = (_raw$blocks = raw === null || raw === void 0 ? void 0 : raw.blocks) !== null && _raw$blocks !== void 0 ? _raw$blocks : [];
  var entityMap = (_raw$entityMap = raw === null || raw === void 0 ? void 0 : raw.entityMap) !== null && _raw$entityMap !== void 0 ? _raw$entityMap : {};
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, blocks.map(function (block, i) {
    return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, {
      key: block.key || i
    }, i > 0 && /*#__PURE__*/_react["default"].createElement("br", null), renderCaptionBlock(block, entityMap));
  }));
}
function hasCaptionRichText(raw) {
  var _raw$blocks2;
  if (!(raw !== null && raw !== void 0 && (_raw$blocks2 = raw.blocks) !== null && _raw$blocks2 !== void 0 && _raw$blocks2.length)) return false;
  return raw.blocks.some(function (b) {
    var _b$text;
    return ((_b$text = b.text) !== null && _b$text !== void 0 ? _b$text : '').trim().length > 0;
  });
}
function ImageBlock(props) {
  var block = props.block,
    contentState = props.contentState;
  var entityKey = block.getEntityAt(0);
  var entity = contentState.getEntity(entityKey);
  var _entity$getData = entity.getData(),
    desc = _entity$getData.desc,
    name = _entity$getData.name,
    _entity$getData$resiz = _entity$getData.resized,
    resized = _entity$getData$resiz === void 0 ? {} : _entity$getData$resiz,
    _entity$getData$resiz2 = _entity$getData.resizedWebp,
    resizedWebp = _entity$getData$resiz2 === void 0 ? {} : _entity$getData$resiz2,
    url = _entity$getData.url,
    src = _entity$getData.src,
    captionRichText = _entity$getData.captionRichText;

  // Check if resized images exist, otherwise fallback to src
  var hasResizedImages = resized && Object.keys(resized).length > 0;
  var imagesToUse = hasResizedImages ? resized : src ? {
    original: src
  } : {};
  var webpImagesToUse = resizedWebp && Object.keys(resizedWebp).length > 0 ? resizedWebp : {};
  var image = /*#__PURE__*/_react["default"].createElement(_reactImage["default"], {
    images: imagesToUse,
    imagesWebP: webpImagesToUse,
    defaultImage: defaultImage,
    alt: name || desc,
    rwd: {
      mobile: '100vw',
      tablet: '608px',
      desktop: '640px',
      "default": '100%'
    },
    priority: true
  });
  var useRichCaption = hasCaptionRichText(captionRichText);
  return /*#__PURE__*/_react["default"].createElement(Figure, null, url ? /*#__PURE__*/_react["default"].createElement("a", {
    href: url,
    target: "_blank",
    rel: "noopener noreferrer"
  }, image) : image, /*#__PURE__*/_react["default"].createElement(FigureCaption, null, useRichCaption ? /*#__PURE__*/_react["default"].createElement(CaptionRichText, {
    raw: captionRichText
  }) : url ? /*#__PURE__*/_react["default"].createElement(CaptionLink, {
    href: url,
    target: "_blank",
    rel: "noopener noreferrer"
  }, desc) : desc));
}