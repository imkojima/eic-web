"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InfoBoxBlock = InfoBoxBlock;
var _react = _interopRequireDefault(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _reactImage = _interopRequireDefault(require("@readr-media/react-image"));
var _sharedStyle = require("../shared-style");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Root-relative path served by the consuming app's /public directory — see
// image-block.tsx for why the bundled asset import 404s in production.
var defaultImage = '/post-default.png';
var infoboxDefaultSpacing = 8;
var InfoBoxRenderWrapper = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoBoxRenderWrapper",
  componentId: "sc-12mxi9r-0"
})(["background:", ";border:1px solid ", ";position:relative;padding:10px;width:100%;", ";"], function (_ref) {
  var theme = _ref.theme;
  return theme.colors.grayscale[99];
}, function (_ref2) {
  var theme = _ref2.theme;
  return theme.colors.primary[40];
}, function (_ref3) {
  var theme = _ref3.theme;
  return theme.margin["default"];
});
var InfoBoxLayout = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoBoxLayout",
  componentId: "sc-12mxi9r-1"
})(["display:flex;flex-direction:column;", "{flex-direction:row;gap:24px;}"], function (_ref4) {
  var theme = _ref4.theme;
  return theme.breakpoint.md;
});
var InfoTextArea = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoTextArea",
  componentId: "sc-12mxi9r-2"
})(["flex:1;min-width:0;"]);
var InfoTitle = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoTitle",
  componentId: "sc-12mxi9r-3"
})(["width:100%;font-style:normal;font-weight:700;", ";line-height:1.5;letter-spacing:0.03em;color:#2d7a4f;padding:0;margin-bottom:16px;"], function (_ref5) {
  var theme = _ref5.theme;
  return theme.fontSize.lg;
});
var InfoContent = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoContent",
  componentId: "sc-12mxi9r-4"
})(["padding:0;font-style:normal;font-weight:400;font-size:14px;line-height:1.5;color:", ";> div > * + *{margin:", "px 0 0;min-height:0.01px;}h2{", "}ul{", " margin-top:", "px;> li{", " & + li{margin:", "px 0 0;}}}ol{", " margin-top:", "px;> li{", " & + li{margin:", "px 0 0;}}}a{", "}blockquote{", "}"], function (_ref6) {
  var theme = _ref6.theme;
  return theme.colors.grayscale[40];
}, infoboxDefaultSpacing, _sharedStyle.defaultH2Style, _sharedStyle.defaultUlStyle, infoboxDefaultSpacing, _sharedStyle.defaultUnorderedListStyle, infoboxDefaultSpacing / 2, _sharedStyle.defaultOlStyle, infoboxDefaultSpacing, _sharedStyle.defaultOrderedListStyle, infoboxDefaultSpacing / 2, _sharedStyle.defaultLinkStyle, _sharedStyle.defaultBlockQuoteStyle);
var InfoImage = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoImage",
  componentId: "sc-12mxi9r-5"
})(["width:100%;max-width:250px;margin:0 0 16px;flex-shrink:0;img{width:100%;height:auto !important;display:block;}", "{margin:0;}"], function (_ref7) {
  var theme = _ref7.theme;
  return theme.breakpoint.md;
});
var InfoImageCaption = _styledComponents["default"].div.withConfig({
  displayName: "info-box-block__InfoImageCaption",
  componentId: "sc-12mxi9r-6"
})(["font-size:12px;line-height:1.25;color:", ";margin-top:8px;overflow-wrap:break-word;word-break:break-word;"], function (_ref8) {
  var theme = _ref8.theme;
  return theme.colors.grayscale[40];
});
var ParagraphDivider = _styledComponents["default"].hr.withConfig({
  displayName: "info-box-block__ParagraphDivider",
  componentId: "sc-12mxi9r-7"
})(["border:none;margin:16px 0;"]);
function InfoBoxParagraphItem(_ref9) {
  var _image$imageFile;
  var paragraph = _ref9.paragraph,
    title = _ref9.title;
  var body = paragraph.body,
    image = paragraph.image,
    caption = paragraph.caption;
  var hasImage = (image === null || image === void 0 ? void 0 : image.resized) || (image === null || image === void 0 || (_image$imageFile = image.imageFile) === null || _image$imageFile === void 0 ? void 0 : _image$imageFile.url);
  if (!hasImage) {
    return /*#__PURE__*/_react["default"].createElement(InfoContent, {
      className: "infobox-content"
    }, body && /*#__PURE__*/_react["default"].createElement("div", {
      dangerouslySetInnerHTML: {
        __html: body
      }
    }));
  }
  return /*#__PURE__*/_react["default"].createElement(InfoBoxLayout, null, /*#__PURE__*/_react["default"].createElement(InfoImage, null, /*#__PURE__*/_react["default"].createElement(_reactImage["default"], {
    images: image.resized || {},
    defaultImage: defaultImage,
    alt: image.name || caption || title || '',
    rwd: {
      mobile: '100vw',
      tablet: '240px',
      desktop: '240px',
      "default": '100%'
    }
  }), caption && /*#__PURE__*/_react["default"].createElement(InfoImageCaption, null, caption)), /*#__PURE__*/_react["default"].createElement(InfoTextArea, null, /*#__PURE__*/_react["default"].createElement(InfoContent, {
    className: "infobox-content"
  }, body && /*#__PURE__*/_react["default"].createElement("div", {
    dangerouslySetInnerHTML: {
      __html: body
    }
  }))));
}
function InfoBoxBlock(props) {
  var _image$imageFile2;
  var block = props.block,
    contentState = props.contentState;
  var entityKey = block.getEntityAt(0);
  var entity = contentState.getEntity(entityKey);
  var _entity$getData = entity.getData(),
    title = _entity$getData.title,
    body = _entity$getData.body,
    image = _entity$getData.image,
    paragraphs = _entity$getData.paragraphs;

  // New format: paragraphs array
  if (paragraphs && Array.isArray(paragraphs) && paragraphs.length > 0) {
    return /*#__PURE__*/_react["default"].createElement(InfoBoxRenderWrapper, {
      className: "infobox-wrapper"
    }, title && /*#__PURE__*/_react["default"].createElement(InfoTitle, {
      className: "infobox-title"
    }, title), paragraphs.map(function (paragraph, index) {
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, {
        key: index
      }, index > 0 && /*#__PURE__*/_react["default"].createElement(ParagraphDivider, null), /*#__PURE__*/_react["default"].createElement(InfoBoxParagraphItem, {
        paragraph: paragraph,
        title: title
      }));
    }));
  }

  // Legacy format: single body + image
  var hasImage = (image === null || image === void 0 ? void 0 : image.resized) || (image === null || image === void 0 || (_image$imageFile2 = image.imageFile) === null || _image$imageFile2 === void 0 ? void 0 : _image$imageFile2.url);
  return /*#__PURE__*/_react["default"].createElement(InfoBoxRenderWrapper, {
    className: "infobox-wrapper"
  }, hasImage ? /*#__PURE__*/_react["default"].createElement(InfoBoxLayout, null, /*#__PURE__*/_react["default"].createElement(InfoImage, null, /*#__PURE__*/_react["default"].createElement(_reactImage["default"], {
    images: image.resized || {},
    defaultImage: defaultImage,
    alt: image.name || image.caption || title,
    rwd: {
      mobile: '100vw',
      tablet: '240px',
      desktop: '240px',
      "default": '100%'
    }
  }), image.caption && /*#__PURE__*/_react["default"].createElement(InfoImageCaption, null, image.caption)), /*#__PURE__*/_react["default"].createElement(InfoTextArea, null, /*#__PURE__*/_react["default"].createElement(InfoTitle, {
    className: "infobox-title"
  }, title), /*#__PURE__*/_react["default"].createElement(InfoContent, {
    className: "infobox-content"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    dangerouslySetInnerHTML: {
      __html: body
    }
  })))) : /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(InfoTitle, {
    className: "infobox-title"
  }, title), /*#__PURE__*/_react["default"].createElement(InfoContent, {
    className: "infobox-content"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    dangerouslySetInnerHTML: {
      __html: body
    }
  }))));
}